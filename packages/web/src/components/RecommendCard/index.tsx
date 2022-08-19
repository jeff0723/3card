import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Countdown from 'react-countdown'
import { Frequency, ADDRESS_TAGS } from 'scan-helper'
import { CheckResult, RecResult } from 'rec-helper'
import { useAccount } from 'wagmi'
// import { useAppSelector } from 'state/hooks'
import { MediaSet, NftImage, Profile } from 'generated/types'
import InfoCard from './InfoCard'
import Button from 'components/UI/Button'


type Props = {}
const _tags = [
    "Uniswap V2 Trader",
    "Uniswap V3 LP",
    "Opensea Transaction maker"
]

const hourToUnix = (hour: number) => {
    return hour * 60 * 60 * 1000
}
const RecommendCard: NextPage = (props: Props) => {
    // const recommendUser = useAppSelector(state => state.application.recommendUser)
    const { address } = useAccount()
    const [netWorth, setNetworth] = useState(0)
    const [ranking, setRanking] = useState<Frequency[]>([])
    const [ifRegistered, setIfRegistered] = useState<boolean>(false)
    const [ifDrawable, setIfDrawable] = useState<boolean>(false)
    const [recommendAddress, setRecommendAddress] = useState<string>('')
    const [tags, setTags] = useState<string[]>(_tags)
    const [isDrew, setIsDrew] = useState<boolean>(false)

    const checkRegister = async (address: string) => {
        // const check = await fetch(`http://localhost:3000/api/recommend/check?account=${address}`)
        const check = await fetch(`http://localhost:3000/api/recommend/check?account=${address}&test=true`)
        const res = check.ok ? check : await fetch(`http://localhost:3000/api/recommend/register?account=${address}`)
        setIfRegistered(res.ok);
        setIfDrawable((await res.json() as CheckResult).ifDrawable);
    }

    const recommend = async (address: string): Promise<boolean> => {
        // const recResponse = await fetch(`http://localhost:3000/api/recommend?account=${address}`)
        const recResponse = await fetch(`http://localhost:3000/api/recommend?account=${address}&test=true`)
        if (!recResponse.ok) {
            console.log('rec error')
            setRecommendAddress('')
            return false;
        } else {
            const recResult = (await recResponse.json()) as RecResult
            setRecommendAddress(recResult.account)
            setRanking(recResult.ranking??[])
            return true;
        }
    };

    useEffect(() => {
        if (address) checkRegister(address)
    }, [address])

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
        e.preventDefault();
        if (address && ifRegistered && ifDrawable) {
            setIsDrew(await recommend(address))
        }
    }

    useEffect(() => {
        const tagSet = new Set<string>();
        try {
            for (const addressFreq of ranking) {
                const tagName = ADDRESS_TAGS.get(addressFreq.address)
                if (tagName && !tagSet.has(tagName)) tagSet.add(tagName)
                if (tagSet.size >= 5) break
            }
            setTags([...tagSet])
        } catch {
            setTags([])
        }
    }, [ranking])

    console.log("recommend address:", recommendAddress)
    console.log("drawable:", ifDrawable)

    return (
        <div className='grid grid-cols-4 w-full'>

            <div className="col-start-2 col-span-2 flex flex-col gap-10">
                <div className='flex justify-between items-center gap-2 p-4' >
                    <div className='font-bold text-[20px]'>Card of Today </div>
                    {!ifDrawable?
                        <div >Time Left: <Countdown date={new Date().setHours(24, 0, 0, 0)} /></div>
                        :<></>
                    }
                </div>
                {isDrew? <InfoCard
                    recommendAddress={recommendAddress}
                    tags={tags}
                    netWorth={netWorth} />
                    :
                    <Button outline onClick={handleClick} disabled={!ifDrawable}>Draw</Button>
                }
            </div>

        </div>
    )
}

export default RecommendCard