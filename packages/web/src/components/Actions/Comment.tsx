import CreateCommentModal from 'components/Comment/CreateCommentModal';
import React, { useState } from 'react'
import { IoChatbubbleOutline } from "react-icons/io5";
import { useAppSelector } from 'state/hooks';
import { Publication, MediaSet, NftImage, Profile } from 'generated/types'
import toast from 'react-hot-toast';

type Props = {
    post: Publication
}

const Comment = ({ post }: Props) => {

    const [commentModelOpen, setCommentModelOpen] = useState(false)
    const [count, setCount] = useState(post?.stats?.totalAmountOfComments)
    const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)
    return (
        <div className='flex gap-2 text-white hover:text-sky-400 items-center' onClick={(e) => {
            if (!isAuthenticated) {
                toast.error("Please login first!")
            }
            e.stopPropagation()
            setCommentModelOpen(true)
        }}>
            <div className='flex justify-center items-center w-8 h-8 rounded-full  hover:bg-primary-blue hover:bg-opacity-20 '>
                <IoChatbubbleOutline className='text-[20px]' />
            </div>
            <div className='text-[13px]'>{count}</div>
            <CreateCommentModal
                open={commentModelOpen}
                setOpen={setCommentModelOpen}
                count={count}
                setCount={setCount}
                post={post as Publication & { profile: Profile & { picture: MediaSet & NftImage } }} />
        </div>
    )
}

export default Comment