import { Profile, MediaSet, NftImage } from 'generated/types'
import React from 'react'


interface Props {
    profile: Profile & { picture: MediaSet & NftImage }
}

const PostHeader = ({ profile }: Props) => {

    return (
        <div className='flex flex-col min-w-fit'>
            <img
                src={profile?.picture?.original?.url || profile?.picture?.uri}
                className="rounded-full w-10 h-10" />
        </div>
    )
}

export default PostHeader