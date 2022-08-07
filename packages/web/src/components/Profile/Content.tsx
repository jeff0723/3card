import { PROFILE_FEED_QUERY } from 'graphql/query/posts'
import React, { useState } from 'react'
import { PaginatedResultInfo, Profile, Post, Comment, Mirror, MediaSet, NftImage } from 'generated/types'
import { useQuery } from '@apollo/client'
import { useAppSelector } from 'state/hooks'
import PostHeader from './PostHeader'
import PostBody from './PostBody'

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
    console.log(data)
    return (
        <div className='px-4 py-2 flex flex-col'>
            {publications.map((post) => (
                <div className='flex gap-[10px] border-b border-border-gray pb-4'>
                    <PostHeader profile={post.profile as Profile & { picture: MediaSet & NftImage }} />
                    <PostBody post={post} />
                </div>
            ))}
        </div>
    )
}

export default Content