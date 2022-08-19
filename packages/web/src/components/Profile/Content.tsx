import { PROFILE_FEED_QUERY } from 'graphql/query/posts'
import React, { useState } from 'react'
import { PaginatedResultInfo, Profile, Post, Comment, Mirror, MediaSet, NftImage } from 'generated/types'
import { useQuery } from '@apollo/client'
import { useAppSelector } from 'state/hooks'
import PostHeader from './PostHeader'
import PostBody from './PostBody'
import InfiniteScroll from 'react-infinite-scroll-component'
import ProfileLoading from './ProfileLoading'
import { HiOutlineHeart, HiOutlineSwitchHorizontal, } from "react-icons/hi";
import { Spinner } from 'components/UI/Spinner'
import Link from 'next/link'
import SingleThread from 'components/Publication/SingleThread'
import NFTPost from './NFTPost'

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
        errorPolicy: "all",
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
    console.log(publications)
    return (
        <>
            {loading && <ProfileLoading />}
            {!loading && data?.publications?.items?.length !== 0 && (
                <InfiniteScroll
                    dataLength={publications.length}
                    next={fetchMoreData}
                    loader={<div className='flex justify-center'><Spinner size='md' /></div>}
                    hasMore={pageInfo?.next && pageInfo?.totalCount && publications.length !== pageInfo?.totalCount}
                    scrollableTarget="scrollableDiv"
                    className='no-scrollbar'
                >
                    {publications.map((post, index) => (
                        (
                            post?.metadata?.attributes[0].value === 'NFTPost' ?
                                <NFTPost post={post} />
                                :
                                <SingleThread post={post} key={index} />

                        )

                    ))}
                </InfiniteScroll>
            )}
            {!error && !loading && data?.publications?.items?.length == 0 &&
                <div>
                    No {currentTab.charAt(0) + currentTab.slice(1).toLowerCase()} yet
                </div>}
        </>

    )
}

export default Content