import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useAppSelector } from 'state/hooks'
import Button from 'components/UI/Button'
import Countdown from 'react-countdown';
import { Frequency, ScanRankingResult, ADDRESS_TAGS } from 'scan-helper';
import getIPFSLink from 'utils/getIPFSLink';


type Props = {}
const _tags = [
    "Uniswap V2 Trader",
    "Uniswap V3 LP",
    "Opensea Transaction maker"
]

const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
const hourToUnix = (hour: number) => {
    return hour * 60 * 60 * 1000
}
const RecommendCard: NextPage = (props: Props) => {
    const recommendUser = useAppSelector(state => state.application.recommendUser)
    const [netWorth, setNetworth] = useState(0)
    const [ranking, setRanking] = useState<Frequency[]>([])
    const [tags, setTags] = useState<string[]>(_tags)
    const getRanking = async (address: string) => {
        const query = await fetch(`http://localhost:3000/api/query/ranking?account=${address}&chain=ether`)
        const res = query.ok ? query : await fetch(`http://localhost:3000/api/update/ranking?account=${address}&chain=ether`)
        if (!res.ok) {
            console.log('scan error:', await res.json())
            setRanking([])
        }
        const rankingResult = (await res.json()) as ScanRankingResult
        setRanking(rankingResult.ranking)
    };
    useEffect(() => {
        if (recommendUser) {
            const address = recommendUser?.ownedBy
            getRanking(address)
            setNetworth(100000)
        }
    }, [recommendUser])

    useEffect(() => {
        if (recommendUser) {
            const address = recommendUser?.ownedBy
            const getRanking = async (address: string) => {
                const query = await fetch(`http://localhost:3000/api/query/ranking?account=${address}&chain=ether`)
                const res = query.ok ? query : await fetch(`http://localhost:3000/api/update/ranking?account=${address}&chain=ether`)
                if (!res.ok) {
                    console.log('scan error:', await res.json())
                    setRanking([])
                }
                const rankingResult = (await res.json()) as ScanRankingResult
                setRanking(rankingResult.ranking)
            };
            getRanking(address)
            setNetworth(100000)
        }
    }, [recommendUser])

    useEffect(() => {
        const tagSet = new Set<string>();
        for (const addressFreq of ranking) {
            const tagName = ADDRESS_TAGS.get(addressFreq.address)
            if (tagName && !tagSet.has(tagName)) tagSet.add(tagName)
            if (tagSet.size >= 5) break
        }
        setTags([...tagSet])
    }, [ranking])

    return (
        <div className='grid grid-cols-4 w-full'>


            <div className="col-start-2 col-span-2 flex flex-col gap-10">
                <div className='flex justify-between items-center gap-2 p-4' >
                    <div className='font-bold text-[20px]'>Card of Today </div>
                    <div >Time Left: <Countdown date={new Date().setHours(24, 0, 0, 0)} /></div>
                </div>
                <div className='flex flex-col items-center '>

                    <img
                        //@ts-ignore
                        src={getIPFSLink(recommendUser?.coverPicture?.original?.url)} className='h-40 w-full' />
                    <div className='-mt-20'>
                        <img src={getIPFSLink(recommendUser?.picture?.original?.url)} className="w-40 h-40 rounded-full ring-8 ring-black" />
                    </div>
                    <div className='flex flex-col py-[16px]'>
                        <div>{recommendUser?.name}</div>
                        <div className='text-gray-400'>@{recommendUser?.handle}</div>


                    </div>
                    <div className='flex justify-center gap-4 w-full'>
                        <Button outline>Follow</Button>
                        <Button outline>Message</Button>

                    </div>


                    <div className='w-full  py-[16px] flex flex-col'>
                        <div className='font-bold text-[15px]'>Bio:</div>
                        <div>
                            {recommendUser?.bio}
                        </div>
                    </div>
                    <div className='w-full  py-[16px] flex flex-col'>
                        <div className='font-bold text-[15px]'>
                            Net worth:
                        </div>
                        <div>
                            ${formatNumber(netWorth)}
                        </div>
                    </div>
                    {tags.length > 0 &&
                        <div className='w-full flex justify-center flex-wrap gap-[10px]  py-[16px]'>
                            {tags.map((item, index) => (
                                <div key={index} className='px-2 py-1 bg-primary-blue bg-opacity-30 rounded-lg'>
                                    {item}
                                </div>
                            ))}
                        </div>}
                    <div className='w-full flex justify-center  py-[16px]'>
                        <div className='text-primary-blue hover:underline'>More Info</div>

                    </div>

                    <div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default RecommendCard