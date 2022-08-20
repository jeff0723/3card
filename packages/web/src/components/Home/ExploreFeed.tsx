import React from 'react'
import { useQuery } from "@apollo/client";
import NFTPost from "components/Profile/NFTPost";
import ProfileLoading from "components/Profile/ProfileLoading";
import SingleThread from "components/Publication/SingleThread";
import { Spinner } from "components/UI/Spinner";
import { PaginatedResultInfo, Publication } from "generated/types";
import { HOME_FEED_QUERY } from "graphql/query/home-feed-query";
import type { NextPage } from 'next';
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAppSelector } from "state/hooks";
import styled from "styled-components";
import CreateButton from "./CreateButton";
import Feed from "./Feed";
import Search from "./Search";
import { EXPLORE_FEED_QUERY } from 'graphql/query/explore-feed-query';
type Props = {
    feedType?: string;
}

const ExploreFeed = ({
    feedType = "TOP_COMMENTED"
}: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser)
    const [publications, setPublications] = useState<Publication[]>([])
    const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
    const { data, loading, error, fetchMore } = useQuery(EXPLORE_FEED_QUERY, {
        variables: {
            request: {
                sortCriteria: feedType,
                limit: 10,
            },
            reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
            profileId: currentUser?.id ?? null
        },
        onCompleted(data) {
            setPageInfo(data?.explorePublications?.pageInfo)
            setPublications(data?.explorePublications?.items)
            console.log(
                '[Query]',
                `Fetched first 10 explore publications FeedType: ${feedType}`
            )
        },
        onError(error) {
            console.error('[Query Error]', error)
        }
    })

    const fetchMoreFeeds = async () => {
        fetchMore({
            variables: {
                request: {
                    sortCriteria: feedType,
                    cursor: pageInfo?.next,
                    limit: 10,
                },
                reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
                profileId: currentUser?.id ?? null
            }
        }).then(({ data }) => {
            console.log("[Query Result]: ", data)
            setPageInfo(data?.explorePublications?.pageInfo)
            setPublications([...publications, ...data?.explorePublications?.items])
        }).catch(err => {
            console.log('[Query Error]', err)
        })
    }
    return (
        <>
            {
                publications && publications.length > 0 &&

                <div className="overflow-y-auto no-scrollbar h-screen w-full" style={{ height: '85vh' }} id='scrollableDiv'>

                    <InfiniteScroll
                        dataLength={publications?.length}
                        next={fetchMoreFeeds}
                        loader={<div className='flex justify-center'><Spinner size='md' /></div>}
                        hasMore={pageInfo?.next && pageInfo?.totalCount && publications.length !== pageInfo?.totalCount}
                        scrollableTarget="scrollableDiv"
                        className='no-scrollbar'
                    >
                        {publications.map((post, index) => (
                            (
                                post?.metadata?.attributes[0]?.value === 'NFTPost' ?
                                    <NFTPost post={post} />
                                    :
                                    <SingleThread post={post} key={index} />

                            )
                        ))}
                    </InfiniteScroll>
                </div>
            }
        </>
    )
}

export default ExploreFeed