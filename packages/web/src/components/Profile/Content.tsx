import { PROFILE_FEED_QUERY } from 'graphql/query/posts'
import React, { useState } from 'react'
import { PaginatedResultInfo, Profile, Post, Comment, Mirror, MediaSet, NftImage } from 'generated/types'
import { useQuery } from '@apollo/client'
import { useAppSelector } from 'state/hooks'
import PostHeader from './PostHeader'
import PostBody from './PostBody'
import InfiniteScroll from 'react-infinite-scroll-component'

interface Props {
    currentTab: string
    profile: Profile
}
export type Publication = Post & Mirror & Comment

const Content = ({ currentTab, profile }: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser)
    const [publications, setPublications] = useState<Publication[]>([])
    const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
    const { data, loading, error, fetchMore } = useQuery(PROFILE_FEED_QUERY, {
        variables: {
            request: { publicationTypes: currentTab, profileId: profile?.id, limit: 10 },
            reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
            profileId: currentUser?.id ?? null
        },
        skip: !profile?.id,
        fetchPolicy: 'no-cache',
        onCompleted(data) {
            setPageInfo(data?.publications?.pageInfo)
            setPublications(data?.publications?.items)
            console.log(
                '[Query]',
                `Fetched first 10 profile publications Profile:${profile?.id}`
            )
        },
        onError(error) {
            console.error('[Query Error]', error)
        }
    })
    const fetchMoreData = async () => {
        fetchMore({
            variables: {
                request: { publicationTypes: currentTab, cursor: pageInfo?.next, profileId: profile?.id, limit: 10 },
                reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
                profileId: currentUser?.id ?? null
            }
        }).then(({ data }) => {
            console.log("[Query Result]: ", data)
            setPageInfo(data?.publications?.pageInfo)
            setPublications([...publications, ...data?.publications?.items])
        }).catch(err => {
            console.log('[Query Error]', err)
        })
    }
    return (
        <div className='px-4 py-2 flex flex-col gap-2'>
            <InfiniteScroll
                dataLength={publications.length}
                next={fetchMoreData}
                loader={<div>loading</div>}
                hasMore={pageInfo?.next && pageInfo?.totalCount && publications.length !== pageInfo?.totalCount}
                endMessage={<h4>Nothing more to show</h4>}
            >
                {publications.map((post, index) => (
                    <div className='flex gap-[10px] border-b border-border-gray pb-4' key={index}>
                        <PostHeader profile={post?.profile as Profile & { picture: MediaSet & NftImage }} />
                        <PostBody post={post} />
                    </div>
                ))}
            </InfiniteScroll>
        </div>
    )
}

export default Content