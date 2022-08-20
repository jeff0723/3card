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
import getAttribute from 'utils/getAttribute'
import { useRouter } from 'next/router'

interface Props {
    post: Publication
    mirror?: boolean
}
dayjs.extend(relativeTime)
const PostBody = ({ post, mirror }: Props) => {
    const profile = mirror ? post.mirrorOf.profile as Profile : post.profile as Profile
    const isCommunity = post?.metadata?.attributes[0]?.value === 'community'
    const router = useRouter()
    return (
        <div className='flex flex-col text-[15px] gap-2 pb-4'>
            <div className='flex gap-2 hover:cursor-pointer' onClick={(e) => {
                e.stopPropagation()
                router.push(`/user/${profile.handle}`)
            }} >
                <div className='hover:underline'>{profile?.name}</div>
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
                <Comment post={post} />
                <Like post={post} />
                <Mirror post={post} />
                <Collect post={post} />
            </div>}

        </div>
    )
}

export default PostBody