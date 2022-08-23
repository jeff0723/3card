import { useMutation } from '@apollo/client';
import Collect from 'components/Actions/Collect';
import Comment from 'components/Actions/Comment';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Publication } from 'generated/types';
import { ADD_REACTION_MUTATION } from 'graphql/mutation/add-reaction-mutation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BiDownvote, BiUpvote } from 'react-icons/bi';
import { BsChat } from "react-icons/bs";
import { HiOutlineBookmark } from "react-icons/hi";
import { useAppSelector } from 'state/hooks';
import { Mixpanel } from 'utils/Mixpanel';


dayjs.extend(relativeTime)
type Props = {
    comment: Publication
}

const Post = ({ comment }: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser)
    const [count, setCount] = useState<number>(0)
    useEffect(() => {
        if (comment) {
            setCount(comment?.stats.totalUpvotes - comment?.stats.totalDownvotes)

        }
    }, [comment])
    const [addReaction] = useMutation(ADD_REACTION_MUTATION, {
        onCompleted: (data) => {
            console.log(data)
            Mixpanel.track("publication.upvote", { result: 'success' })
        },
        onError(error) {
            toast.error(error.message)
            Mixpanel.track("publication.like", { result: 'error' })

        }
    })
    const handleUpVote = () => {
        if (comment.reaction == 'UPVOTE') return toast.error("Already upvoted")
        const variable = {
            variables: {
                request: {
                    profileId: currentUser?.id,
                    reaction: 'UPVOTE',
                    publicationId: comment?.id
                }
            }
        }
        addReaction(variable)
        setCount(count + 1)
        toast.success('Upvote success!')
    }
    const handleDownVote = () => {
        if (comment.reaction == 'UPVOTE') return toast.error("Already downvoted")
        const variable = {
            variables: {
                request: {
                    profileId: currentUser?.id,
                    reaction: 'DOWNVOTE',
                    publicationId: comment?.id
                }
            }
        }
        addReaction(variable)
        setCount(count + 1)
        toast.success('Downvote success!')

    }

    return (
        <Link href={`/post/${comment?.id}`}>
            <div className='flex gap-4 py-4 border-b border-border-gray'>
                <div className='flex flex-col items-center gap-2'>
                    <div onClick={handleUpVote} className='hover:bg-green-400 hover:bg-opacity-30 rounded-full w-7 h-7 flex justify-center items-center'>
                        <BiUpvote className='text-[20px] text-green-400' />
                    </div>
                    <div>{count}</div>
                    <div onClick={handleDownVote} className='hover:bg-red-400 hover:bg-opacity-30 rounded-full w-7 h-7 flex justify-center items-center'>
                        <BiDownvote className='text-[20px] text-red-400' />
                    </div>
                </div>
                <div className='flex flex-col gap-2'>
                    <div className='text-gray-400'>Posted by @{comment?.profile?.handle} {dayjs(new Date(comment?.createdAt)).fromNow()}</div>
                    <div className='text-[20px] font-bold'>{comment?.metadata?.name}</div>
                    <div>{comment?.metadata?.content}</div>
                    <div className='flex gap-4 text-[20px]'>
                        <Comment post={comment} />
                        <Collect post={comment} />

                    </div>
                </div>
            </div>
        </Link>
    )
}

export default Post