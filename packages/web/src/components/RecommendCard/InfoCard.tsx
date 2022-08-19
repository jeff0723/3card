import React, { useState } from "react";
import Button from "components/UI/Button";
import { MediaSet, NftImage, Profile } from 'generated/types'
import { useQuery } from "@apollo/client";
import { CURRENT_USER_QUERY } from "graphql/query/user";
import { useAccount } from "wagmi";
import Link from "next/link";

type Props = {
    recommendAddress: string,
    tags: string[],
    netWorth: number,
};

type RecommendUser = Profile & {picture: MediaSet & NftImage }

const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const InfoCard = ({ recommendAddress, tags, netWorth }: Props) => {
    const { isConnected } = useAccount()
    const [recommendUser, setRecommendUser] = useState<RecommendUser>()
    const { data, loading } = useQuery(CURRENT_USER_QUERY, {
        variables: { ownedBy: recommendAddress },
        skip: !isConnected,
        onCompleted(data) {
            console.log('recommendUser data:', data)
            setRecommendUser(data.profiles.items[0])
        },
        onError(error) {
            console.log(error)
        }
    });

    //@ts-ignore
    console.log(recommendUser?.coverPicture?.original?.url)
    console.log("tags:", tags)

    return (
        <div className='flex flex-col items-center '>

        <img
            //@ts-ignore
            src={recommendUser?.coverPicture?.original?.url} className='h-40 w-full' />
        <div className='-mt-20'>
            <img src={recommendUser?.picture?.original?.url} className="w-40 h-40 rounded-full ring-8 ring-black" />
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
            <Link href={`/user/${recommendUser?.handle}`} className='text-primary-blue hover:underline'>More Info</Link>
        </div>

        <div>
        </div>
    </div>);
};

export default InfoCard;
