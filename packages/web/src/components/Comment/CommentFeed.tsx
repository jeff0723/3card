import Collect from 'components/Actions/Collect'
import Comment from 'components/Actions/Comment'
import Like from 'components/Actions/Like'
import Mirror from 'components/Actions/Mirror'
import dayjs from 'dayjs'
import { Publication } from 'generated/types'
import Link from 'next/link'
import getIPFSLink from 'utils/getIPFSLink'

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
                        <Comment post={comment} />
                        <Like post={comment} />
                        <Mirror post={comment} />
                        <Collect post={comment} />
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default CommentFeed