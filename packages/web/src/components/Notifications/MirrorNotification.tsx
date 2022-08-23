import { useQuery } from '@apollo/client';
import { UserProfile } from 'generated/3card-types';
import { NewMirrorNotification } from 'generated/types';
import { GET_PROFILE_BY_ADDRESS } from 'graphql/query/user';
import { FC, useState } from 'react';
import { HiBookmark } from "react-icons/hi";
import getIPFSLink from 'utils/getIPFSLink';
type Props = {
    notification: NewMirrorNotification
}

const MirrorNotification = ({ notification }: Props) => {
    const [profile, setProfile] = useState<UserProfile>()
    const { data, loading, error } =
        useQuery(GET_PROFILE_BY_ADDRESS, {
            variables: { ownedBy: [notification?.profile?.ownedBy] },
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
            <HiBookmark className='mt-1 text-[30px]' />
            <div className='flex flex-col gap-2'>
                <Avatar />
                <div className='text-[15px]'>
                    <span className='font-bold'>{profile?.name}</span> mirrored your post
                </div>
                <div className='text-[15px] text-gray-400'>
                    {notification?.publication?.metadata?.content}
                </div>
            </div>
        </div>
    )
}

export default MirrorNotification