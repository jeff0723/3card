import { Publication } from 'generated/types'
import React from 'react'
import { HiOutlineSwitchHorizontal } from "react-icons/hi"

type Props = {
    post: Publication
}

const MirrorText = ({ post }: Props) => {
    return (
        <div className='flex items-center pb-4 gap-2 text-gray-400 font-bold'>
            <HiOutlineSwitchHorizontal />
            <div> {post?.profile?.name} mirrored {post.mirrorOf?.profile?.name}&apos;s post</div>
        </div>
    )
}

export default MirrorText