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
import getIPFSLink from 'utils/getIPFSLink';
import { Spinner } from 'components/UI/Spinner'
import { NEXT_URL } from 'constants/constants'


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
    const [recommendAddress, setRecommendAddress] = useState<string>('')
    const [tags, setTags] = useState<string[]>(_tags)

    const check = async (address: string) => {
        const check = await fetch(`${NEXT_URL}/api/recommend/check?account=${address}`)
        if (check.ok) {
            const result = (await check.json()) as CheckResult;
            // console.log(result)
            setIfDrawable(result.ifDrawable)
            if (result.lastestRec) {
                setRecommendAddress(result.lastestRec.account)
                setRanking(result.lastestRec.ranking)
            } else {
                recommend(address)
            }
        }
    }

    const recommend = async (address: string) => {
        const recResponse = await fetch(`${NEXT_URL}/api/recommend?account=${address}`)
        if (!recResponse.ok) {
            setRecommendAddress('0xa77d84dd50ac12a5c98846e673b29c5ddb079f50')
        } else {
            const recResult = (await recResponse.json()) as RecResult
            setRecommendAddress(recResult.account)
            setRanking(recResult.ranking)
        }
    };

    const getNetworth = async (recAddress: string) => {
        const res = await fetch(`${NEXT_URL}/api/query/networth?account=${recAddress}`);
        if (res.ok) {
            const result = await res.json();
            if (result.networth) setNetworth(result.networth);
        }
    }

    useEffect(() => {
        if (address) check(address)
    }, [address])

    useEffect(() => {
        if (address && ifDrawable) recommend(address)
    }, [address, ifDrawable])

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

    useEffect(() => {
        if (recommendAddress) getNetworth(recommendAddress)
    }, [recommendAddress])
    
    return (
        <div className='grid grid-cols-4 w-full'>

            <div className="col-start-2 col-span-2 flex flex-col gap-10">
                <div className='flex justify-between items-center gap-2 p-4' >
                    <div className='font-bold text-[20px]'>Card of Today </div>
                    <div >Next Card: <Countdown date={new Date().setHours(24, 0, 0, 0)} /></div>
                </div>
                {recommendAddress ? <InfoCard
                    recommendAddress={recommendAddress}
                    tags={tags}
                    netWorth={netWorth} />
                    :
                    <div className='flex justify-center items-center'>
                        <Spinner size='lg' />
                    </div>
                }
            </div>

        </div>
    )
}

export default RecommendCard