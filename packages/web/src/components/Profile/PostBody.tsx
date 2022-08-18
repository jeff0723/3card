import React from 'react'
import { Publication } from './Content'
import { Profile, MediaSet, NftImage } from 'generated/types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { HiOutlineHeart, HiOutlineSwitchHorizontal, HiOutlineBookmark } from "react-icons/hi";
import { BsChat } from "react-icons/bs";
import Link from 'next/link'
import CommunityCard from 'components/UI/CommunityCard'
import Comment from 'components/Actions/Comment'
import Like from 'components/Actions/Like'
import Mirror from 'components/Actions/Mirror'
import Collect from 'components/Actions/Collect'

interface Props {
    post: Publication
    mirror?: boolean
}
dayjs.extend(relativeTime)
const PostBody = ({ post, mirror }: Props) => {
    const profile = mirror ? post.mirrorOf.profile as Profile : post.profile as Profile
    const isCommunity = post?.metadata?.attributes[0]?.value === 'community'
    return (
        <div className='flex flex-col text-[15px] gap-2 pb-4'>
            <div className='flex gap-2'>
                <div>{profile?.name}</div>
                <div className='text-gray-400'>@{profile?.handle} · {dayjs(new Date(post?.createdAt)).fromNow()}</div>
            </div>
            <div>
                {!isCommunity ? post?.metadata?.content :
                    (
                        <div className='flex flex-col gap-2'>
                            <div>Launched a community: </div>
                            <CommunityCard community={post} />
                        </div>
                    )}
            </div>
            {post?.metadata?.attributes[0]?.value !== 'community' && <div className='flex gap-10 '>
                {/* <div className='flex gap-2 text-primary-blue'><BsChat /> <div className='text-[13px]'>{post?.stats?.totalAmountOfComments}</div></div>
                 */}
                <Comment post={post} />
                <Like post={post} />
                <Mirror post={post} />
                <Collect post={post} />
                {/* <div className='flex gap-2 text-[#F5222D]'><HiOutlineHeart /><div className='text-[13px]'> {post?.stats?.totalUpvotes}</div></div> */}
                {/* <div className='flex gap-2 text-yellow'><HiOutlineSwitchHorizontal /><div className='text-[13px]'> {post?.stats?.totalAmountOfMirrors}</div></div> */}
                {/* <div className='flex gap-2 text-green'><HiOutlineBookmark /><div className='text-[13px]'> {post?.stats?.totalAmountOfMirrors}</div></div> */}

            </div>}

        </div>
    )
}

export default PostBody