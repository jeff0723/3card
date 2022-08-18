import { useMutation } from '@apollo/client';
import { Publication } from 'generated/types';
import { ADD_REACTION_MUTATION, REMOVE_REACTION_MUTATION } from 'graphql/mutation/add-reaction-mutation';
import { on } from 'process';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineHeart, HiHeart } from "react-icons/hi";
import { useAppSelector } from 'state/hooks';
import styled from 'styled-components';

type Props = {
  post: Publication
}
const Container = styled.div<{ liked: boolean }>`
    color: ${({ liked }) => liked ? "rgba(249,24,128)" : '#fffff'};
    &:hover {
        color: rgba(249,24,128);
    }
`
const HoverBox = styled.div`
    &:hover {
        background: rgba(249,24,128,0.1);
    }
`
const Like = ({ post }: Props) => {
  const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)
  const currentUser = useAppSelector(state => state.user.currentUser)
  const [liked, setLiked] = useState<boolean>(false)
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    const reactionCount = post?.stats?.totalUpvotes
    const reaction = post?.reaction
    setCount(reactionCount)
    setLiked(reaction === 'UPVOTE')
  }, [post])

  const [addReaction] = useMutation(ADD_REACTION_MUTATION, {
    onCompleted() {
      console.log('like')
    },
    onError(error) {
      setLiked(!liked)
      setCount(count - 1)
      toast.error(error.message)

    }
  })

  const [removeReaction] = useMutation(REMOVE_REACTION_MUTATION, {
    onCompleted() {
      console.log('dislike')
    },
    onError(error) {
      setLiked(!liked)
      setCount(count + 1)
      toast.error(error.message)

    }
  })

  const createLike = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (!isAuthenticated) return toast.error("Please login first!")
    const variable = {
      variables: {
        request: {
          profileId: currentUser?.id,
          reaction: 'UPVOTE',
          publicationId: post?.id
        }
      }
    }

    if (liked) {
      setLiked(false)
      setCount(count - 1)
      removeReaction(variable)
    } else {
      setLiked(true)
      setCount(count + 1)
      addReaction(variable)
    }
  }
  return (
    <Container liked={liked} className='flex gap-2 items-center' onClick={createLike}>
      <HoverBox className='flex justify-center items-center w-8 h-8 rounded-full'>

        {liked ? <HiHeart className='text-[20px]' /> : <HiOutlineHeart className='text-[20px]' />}
      </HoverBox>
      <div className='text-[13px]'>{post?.stats?.totalUpvotes}</div>

    </Container>
  )
}

export default Like