import React, { FC, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { NewFollowerNotification, Profile } from 'generated/types'
import AvatarByAddress from './AvatarByAddress'
import { RiUser3Fill } from 'react-icons/ri'
import { useQuery } from '@apollo/client'
import { GET_PROFILE_BY_ADDRESS } from 'graphql/query/user'
import getIPFSLink from 'utils/getIPFSLink'
import { UserProfile } from 'generated/3card-types'
import Link from 'next/link'
dayjs.extend(relativeTime)
type Props = {
    notification: NewFollowerNotification
}

const FollowerNotification = ({ notification }: Props) => {
    const [profile, setProfile] = useState<UserProfile>()
    const { data, loading, error } =
        useQuery(GET_PROFILE_BY_ADDRESS, {
            variables: { ownedBy: [notification?.wallet?.address] },
            onCompleted(data) {
                console.log("[Query complete]", data)
                setProfile(data?.profiles?.items[0])
            }
        })
    const Avatar: FC = () => {
        if (loading) return <div className='w-10 h-10 rounded-full loading' />
        return <img src={getIPFSLink(profile?.picture?.original?.url)} className='w-10 h-10 rounded-full' />
    }
    return (
        <div className='flex gap-2 '>
            <RiUser3Fill className='mt-1 text-[30px]' />
            <Link href={`/user/${profile?.handle}`}>
                <div className='flex flex-col gap-2'>
                    <Avatar />
                    <div className='text-[15px]'>
                        <span className='font-bold hover:underline'>{profile?.name}</span> followed you
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default FollowerNotification