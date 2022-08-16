import { useRouter } from 'next/router'
import React from 'react'
import type { NextPage, GetServerSideProps } from 'next'
import { COMMUNITY_QUERY } from 'graphql/query/community-query'
import { useQuery } from '@apollo/client'
import Button from 'components/UI/Button'
import { useAppSelector } from 'state/hooks'
import { RiImage2Line } from 'react-icons/ri'
import { BiUpvote, BiDownvote } from 'react-icons/bi'
import { HiOutlineHeart, HiOutlineSwitchHorizontal, HiOutlineBookmark } from "react-icons/hi";
import { BsChat } from "react-icons/bs";
import Post from 'components/Community/Post'
import { COMMENT_FEED_QUERY } from 'graphql/query/comment-feed-query'
import CreatePost from 'components/Community/CreatePost'
import Join from 'components/Community/Join'
import { Publication } from 'generated/types'

type Props = {}

const Community: NextPage = (props: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser)
    // const [joined, setJoined] = useState<boolean>(community?.hasCollectedByMe)
    const { query: { community_id } } = useRouter()
    const { data, loading, error } = useQuery(COMMUNITY_QUERY, {
        variables: { request: { publicationId: community_id } },
        skip: !community_id,
        onCompleted: (data) => {
            console.log(data)
            console.log('[Query]', `Fetched community details Community:${community_id}`)
        },
        onError: (error) => {
            console.error('[Query Error]', error)
        }
    })
    const { data: feedData, loading: feedLoading, error: feedError, fetchMore } = useQuery(COMMENT_FEED_QUERY, {
        variables: {
            request: { commentsOf: community_id },
            reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
            profileId: currentUser?.id ?? null
        },
        skip: !community_id,
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            console.log(data)
        },
        onError: (error) => {
            console.error('[Query Error]', error)
        }
    })
    console.log(feedData)
    return (
        <div className='w-full'>
            <div className='grid grid-cols-9 w-full'>
                <div className='flex flex-col gap-4 col-start-3 col-span-5 h-full'>
                    <div className='flex justify-between py-4 border-b border-border-gray'>
                        <div className='flex gap-2'>
                            <img src={data?.publication?.metadata?.cover?.original?.url} className='w-20 h-20 rounded-full' />
                            <div className='flex flex-col justify-end'>
                                <div className='text-[20px]'>{data?.publication?.metadata?.name}</div>
                                <div className='text-[15px]'>{data?.publication?.metadata?.description}</div>
                                <div className='flex gap-2 text-gray-400'>
                                    <div>{data?.publication?.stats?.totalAmountOfCollects} members</div>
                                    <div>{data?.publication?.stats?.totalAmountOfComments} posts</div>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col justify-end'>
                            <Join community={data?.publication} />
                        </div>
                    </div>
                    <CreatePost communityId={community_id as string} />
                    <div className='flex flex-col'>
                        {feedData?.publications?.items.length === 0 && !feedLoading && "No posts yet"}
                        {
                            feedData?.publications?.items?.map((comment: Publication, index: number) => (
                                <Post key={index} comment={comment} />
                            ))
                        }


                    </div>
                </div>
            </div>
        </div>
    )
}


export default Community