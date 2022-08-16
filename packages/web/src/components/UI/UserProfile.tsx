import { NftImage, Profile, MediaSet } from 'generated/types'
import React from 'react'

type Props = {
    profile: Profile & { picture: MediaSet & NftImage }
}

const UserProfile = ({ profile }: Props) => {
    return (
        <div className='flex gap-4'>
            <img src={profile?.picture?.original?.url} className='w-12 h-12 rounded-full' />
            <div className='flex flex-col'>
                <div>{profile?.name}</div>
                <div className='text-gray-400'>@{profile?.handle}</div>

            </div>
        </div>
    )
}

export default UserProfile