import { Profile, MediaSet, NftImage } from 'generated/types'
import React from 'react'


interface Props {
    profile: Profile & { picture: MediaSet & NftImage }
    comment?: boolean
}

const PostHeader = ({ profile, comment }: Props) => {

    return (
        <div className='flex flex-col min-w-fit'>
            <img
                src={profile?.picture?.original?.url || profile?.picture?.uri}
                className="rounded-full w-10 h-10" />
            {comment &&
                <div className='w-full h-full flex justify-center'>
                    <div className='bg-gray-300 border-[0.8px] -my-[4px] border-[#333639]'></div>
                </div>
            }
        </div>
    )
}

export default PostHeader