import React from 'react'
import { Publication } from './Content'
import { Profile, MediaSet, NftImage } from 'generated/types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { HiOutlineHeart, HiOutlineSwitchHorizontal, } from "react-icons/hi";
import { BsChat } from "react-icons/bs";

interface Props {
    post: Publication
}
dayjs.extend(relativeTime)
const PostBody = ({ post }: Props) => {
    const profile = post.profile as Profile
    return (
        <div className='flex flex-col text-[15px] gap-2'>
            <div className='flex gap-2'>
                <div>{profile?.name}</div>
                <div className='text-gray-400'>@{profile?.handle} · {dayjs(new Date(post?.createdAt)).fromNow()}</div>
            </div>
            <div>
                {post?.metadata?.content}
            </div>
            <div className='flex gap-10 text-[20px]'>
                <div className='flex gap-2 text-primary-blue'><BsChat /> <div className='text-[13px]'>{post?.stats?.totalAmountOfComments}</div></div>
                <div className='flex gap-2 text-[#F5222D]'><HiOutlineHeart /><div className='text-[13px]'> {post?.stats?.totalUpvotes}</div></div>
                <div className='flex gap-2 text-yellow'><HiOutlineSwitchHorizontal /><div className='text-[13px]'> {post?.stats?.totalAmountOfMirrors}</div></div>
            </div>
        </div>
    )
}

export default PostBody