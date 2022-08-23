import React from 'react'
import { BiUpvote, BiDownvote } from 'react-icons/bi'
import { HiOutlineHeart, HiOutlineSwitchHorizontal, HiOutlineBookmark } from "react-icons/hi";
import { BsChat } from "react-icons/bs";
import { Publication } from 'generated/types';
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'


dayjs.extend(relativeTime)
type Props = {
    comment: Publication
}

const Post = ({ comment }: Props) => {
    return (
        <div className='flex gap-4 py-4 border-b border-border-gray'>
            <div className='flex flex-col items-center gap-2'>
                <div>
                    <BiUpvote className='text-[20px] text-green-400' />
                </div>
                <div>{comment?.stats.totalUpvotes - comment?.stats.totalDownvotes}</div>
                <div>
                    <BiDownvote className='text-[20px] text-red-400' />
                </div>
            </div>
            <div className='flex flex-col gap-2'>
                <div className='text-gray-400'>Posted by @{comment?.profile?.handle} {dayjs(new Date(comment?.createdAt)).fromNow()}</div>
                <div className='text-[20px] font-bold'>{comment?.metadata?.name}</div>
                <div>{comment?.metadata?.content}</div>
                <div className='flex gap-4 text-[20px]'>
                    <div className='flex gap-2'><BsChat /> <div className='text-[13px]'>5</div></div>

                    <div className='flex gap-2'><HiOutlineBookmark /><div className='text-[13px]'> 4</div></div>

                </div>
            </div>
        </div>
    )
}

export default Post