import dayjs from 'dayjs'
import { Publication } from 'generated/types'
import getIPFSLink from 'utils/getIPFSLink'
import { BiArrowBack } from 'react-icons/bi'
import { BsChat } from "react-icons/bs"
import { HiOutlineBookmark, HiOutlineHeart, HiOutlineSwitchHorizontal } from "react-icons/hi"
import Link from 'next/link'
type Props = {
    comment: Publication
}

const CommentFeed = ({ comment }: Props) => {
    return (
        <Link href={`/post/${comment?.id}`}>
            <div className='flex gap-2 py-4 border-b border-border-gray'>

                <img
                    //@ts-ignore
                    src={getIPFSLink(comment?.profile?.picture?.original?.url)} className='w-12 h-12 rounded-full' />
                <div className='flex flex-col gap-2 w-full'>
                    <div className='flex justify-between items-center'>

                        <div className='flex flex-col text-[15px]'>
                            <div className='font-bold'>{comment?.profile?.name}</div>
                            <div className='text-gray-400'>@{comment?.profile?.handle}</div>
                        </div>
                        <div className='text-[13px] text-gray-400'>
                            {dayjs(new Date(comment?.createdAt)).fromNow()}
                        </div>

                    </div>
                    <div className='py-4 text-[15px]'>
                        {comment?.metadata.content}
                    </div>
                    <div className='flex justify-around text-gray-400'>
                        <div className='flex items-center gap-1'><BsChat className='text-[20px]' /> <div className='text-[15px]'>{comment?.stats?.totalAmountOfComments}</div></div>
                        <div className='flex items-center gap-1'><HiOutlineHeart className='text-[20px]' /><div className='text-[15px]'> {comment?.stats?.totalUpvotes}</div></div>
                        <div className='flex items-center gap-1'><HiOutlineSwitchHorizontal className='text-[20px]' /><div > {comment?.stats?.totalAmountOfMirrors}</div></div>
                        <div className='flex items-center gap-1'><HiOutlineBookmark className='text-[20px]' /><div className='text-[15px]'> {comment?.stats?.totalAmountOfComments}</div></div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default CommentFeed