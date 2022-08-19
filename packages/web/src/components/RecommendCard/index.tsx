import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Countdown from 'react-countdown'
import { Frequency, ADDRESS_TAGS } from 'scan-helper'
import { PersonalRanking } from 'rec-helper'
import { useAccount } from 'wagmi'
// import { useAppSelector } from 'state/hooks'
import { MediaSet, NftImage, Profile } from 'generated/types'
import InfoCard from './InfoCard'


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
    const [ifDrawable, setIfDrawable] = useState<boolean>(false)
    const [ifRegistered, setIfRegistered] = useState<boolean>(false)
    const [recommendAddress, setRecommendAddress] = useState<string>('')
    const [tags, setTags] = useState<string[]>(_tags)

    const checkRegister = async (address: string) => {
        const query = await fetch(`http://localhost:3000/api/recommend/query?account=${address}`)
        const res = query.ok ? query : await fetch(`http://localhost:3000/api/recommend/register?account=${address}`)
        setIfRegistered(res.ok);
    }

    const recommend = async (address: string) => {
        const recResponse = await fetch(`http://localhost:3000/api/recommend?account=${address}&test=true`)
        // const recResponse = await fetch(`http://localhost:3000/api/recommend?account=${address}`)
        if (!recResponse.ok) {
            console.log('rec error')
            setIfDrawable(false)
            setRecommendAddress('')
            setRanking([])
        } else {
            const recResult = (await recResponse.json()) as PersonalRanking
            setIfDrawable(true)
            setRecommendAddress(recResult.account)
            setRanking(recResult.ranking??[])
        }
    };

    useEffect(() => {
        if (address) checkRegister(address)
    }, [address])

    useEffect(() => {
        if (address && ifRegistered) recommend(address)
    }, [address, ifRegistered])

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

    return (
        <div className='grid grid-cols-4 w-full'>

            <div className="col-start-2 col-span-2 flex flex-col gap-10">
                <div className='flex justify-between items-center gap-2 p-4' >
                    <div className='font-bold text-[20px]'>Card of Today </div>
                    <div >Time Left: <Countdown date={new Date().setHours(24, 0, 0, 0)} /></div>
                </div>
                {ifDrawable? <InfoCard
                    recommendAddress={recommendAddress}
                    tags={tags}
                    netWorth={netWorth} />
                    :
                    <div></div>
                }
            </div>

        </div>
    )
}

export default RecommendCard