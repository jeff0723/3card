import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { MediaSet, NewMentionNotification, NftImage, Profile } from 'generated/types'
import Link from 'next/link'
import getIPFSLink from 'utils/getIPFSLink'
dayjs.extend(relativeTime)
type Props = {
    notification: NewMentionNotification

}

const MentionNotification = ({ notification }: Props) => {
    const profile = notification?.mentionPublication?.profile as Profile & { picture: MediaSet & NftImage }
    const type = notification?.mentionPublication?.__typename
    const replyTo = type == 'Comment' ? notification?.mentionPublication?.commentOn?.profile?.handle : ""
    return (
        <Link href={`/post/${notification?.mentionPublication?.id}`}>
            <div className='flex gap-2 '>
                <img src={getIPFSLink(profile?.picture?.original?.url)} className='w-10 h-10 rounded-full' />
                <div className='flex flex-col'>
                    <div>{profile?.name} <span className='text-gray-400'>{profile?.handle} {dayjs(new Date(notification?.createdAt)).fromNow()}</span></div>
                    {replyTo && <div><span className='text-gray-400'>Reply to </span>
                        <Link href={`/user/${replyTo}`}>
                            <span className='text-primary-blue hover:underline'>@{replyTo}</span>
                        </Link>
                    </div>}
                    <div className='text-[20px]'>{notification?.mentionPublication?.metadata?.content}</div>
                </div>
            </div>
        </Link>
    )
}

export default MentionNotification