import React, { useState } from "react";
import Button from "components/UI/Button";
import { MediaSet, NftImage, Profile } from 'generated/types'
import { useQuery } from "@apollo/client";
import { GET_PROFILE_BY_ADDRESS } from "graphql/query/user";
import { useAccount } from "wagmi";
import Link from "next/link";
import FollowButton from "components/Profile/FollowButton";
import Follow from "./Follow";
import { useRouter } from "next/router";
import { useAppSelector } from "state/hooks";
import formatAddress from "utils/formatAddress";
import { ETHERSCAN_URL } from "constants/constants";
import { ExternalLink } from "components/Utils";

type Props = {
    recommendAddress: string,
    tags: string[],
    netWorth: number,
};

type RecommendUser = Profile & { picture: MediaSet & NftImage }

const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const InfoCard = ({ recommendAddress, tags, netWorth }: Props) => {
    const { isConnected } = useAccount()
    const currentUser = useAppSelector(state => state.user.currentUser)
    const router = useRouter()
    const [recommendUser, setRecommendUser] = useState<RecommendUser>()
    const [followed, setFollowed] = useState(false)
    const { data, loading } = useQuery(GET_PROFILE_BY_ADDRESS, {
        variables: { ownedBy: recommendAddress },
        skip: !isConnected,
        onCompleted(data) {
            console.log('recommendUser data:', data)
            setRecommendUser(data.profiles.items[0])
            setFollowed(data.profiles.items[0].isFollowedByMe)
        },
        onError(error) {
            console.log(error)
        }
    });

    //@ts-ignore

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
                <ExternalLink href={`${ETHERSCAN_URL}/address/${recommendAddress}`} ><div className='text-gray-400 hover:text-primary-blue hover:underline'>
                    {formatAddress(recommendAddress)}</div>
                </ExternalLink>


            </div>
            <div className='flex justify-center gap-4 w-full'>

                <Follow profile={recommendUser as Profile & { picture: MediaSet & NftImage }} followed={followed} setFollowed={setFollowed} />
                <button
                    onClick={() => {
                        if (currentUser) {
                            let converstaionId = (BigInt(currentUser.ownedBy) > BigInt(recommendUser?.ownedBy)) ? `${currentUser.ownedBy}-${recommendUser?.ownedBy}` : `${recommendUser?.ownedBy}-${currentUser.ownedBy}`
                            router.push(`/messages/${converstaionId}`)
                        }
                    }}
                    className='flex justify-center items-center rounded-full px-4 py-2 text-primary-blue bg-black border border-primary-blue font-semibold h-10 hover:bg-opacity-10 disabled:bg-opacity-10'>Message</button>
            </div>


            <div className='w-full  py-[16px] flex flex-col'>
                <div className='font-bold text-[15px]'>Bio:</div>
                <div>
                    {recommendUser?.bio ? recommendUser?.bio : 'No bio'}
                </div>
            </div>

            <div className='w-full  py-[16px] flex flex-col'>
                <div className='font-bold text-[15px]'>
                    Net worth:
                </div>
                <div>
                    ${formatNumber(parseFloat(netWorth.toFixed(1)))}
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
                <Link href={`/user/${recommendUser?.handle}`}>
                    <div className='text-primary-blue hover:underline hover:cursor-pointer'>
                        More Info</div>
                </Link>
            </div>

            <div>
            </div>
        </div>);
};

export default InfoCard;
