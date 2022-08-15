import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useAppSelector } from 'state/hooks'
import Button from 'components/UI/Button'
import Countdown from 'react-countdown';

type Props = {}
const tags = [
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
const index: NextPage = (props: Props) => {
    const recommendUser = useAppSelector(state => state.application.recommendUser)
    const [netWorth, setNetworth] = useState(0)
    useEffect(() => {
        if (recommendUser) {
            const address = recommendUser?.ownedBy
            // fetch()
            setNetworth(100000)
        }
    }, [recommendUser])
    console.log(recommendUser)
    return (
        <div className='grid grid-cols-4 w-full'>
            <div className='text-[20px] p-4 font-bold'>Card of Today </div>

            <div className="col-start-2 col-span-2 flex flex-col items-center justify-center">
                <div className='mb-4'>Time Left: <Countdown date={new Date().setHours(24, 0, 0, 0)} /></div>
                <img src={recommendUser?.picture?.original?.url} className="w-40 h-40 rounded-lg" />
                <div className='w-[200px] flex justify-center flex-wrap gap-[10px] border-b border-[#536471] py-[16px]'>
                    {tags.map((item, index) => (
                        <div key={index} className='px-2 py-1 bg-primary-blue bg-opacity-30 rounded-lg'>
                            {item}
                        </div>
                    ))}
                </div>
                <div className='flex justify-center gap-4 w-[200px] border-b border-[#536471] py-[16px]'>
                    <Button outline>Follow</Button>
                    <Button outline>Message</Button>

                </div>
                <div className='w-[200px] border-b border-[#536471] py-[16px]'>
                    {recommendUser?.bio}
                </div>
                <div className='w-[200px] flex justify-between border-b border-[#536471] py-[16px]'>
                    <div>
                        Net worth:
                    </div>
                    <div>
                        ${formatNumber(netWorth)}
                    </div>
                </div>
                <div className='w-[200px] flex justify-center border-b border-[#536471] py-[16px]'>
                    <div className='text-primary-blue hover:underline'>More Info</div>

                </div>
                <div>

                </div>
            </div>

        </div>
    )
}

export default index