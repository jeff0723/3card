import { Profile, MediaSet, NftImage } from 'generated/types'
import React from 'react'
import getIPFSLink from 'utils/getIPFSLink'

type Props = {
    profile: Profile & { picture: MediaSet & NftImage }
}

const ProfileCard = ({ profile }: Props) => {
    return (
        <div className='flex justify-between p-[10px] bg-white bg-opacity-5 rounded-lg'>
            <div className='flex items-center gap-[10px]'>
                <img src={getIPFSLink(profile?.picture?.original.url)} className='rounded-full w-10 h-10' />
                <div className='flex flex-col'>
                    <div>{profile?.name}</div>
                    <div>@{profile?.handle}</div>
                </div>
            </div>
            <div className='flex justify-center items-center'>
                <div className='rounded-full w-[10px] h-[10px] bg-[#23D675]' />
            </div>

        </div>
    )
}

export default ProfileCard