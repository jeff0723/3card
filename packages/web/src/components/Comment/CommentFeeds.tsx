import { useQuery } from '@apollo/client'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Publication } from 'generated/types'
import { COMMENT_FEED_QUERY } from 'graphql/query/comment-feed-query'
import { useState } from 'react'
import { useAppSelector } from 'state/hooks'
import CommentFeed from './CommentFeed'

dayjs.extend(relativeTime)
type Props = {
    publicationId: string
}

const CommentFeeds = ({ publicationId }: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser)
    const [comments, setComments] = useState<Publication[]>([])
    const { data, loading, error, fetchMore } = useQuery(COMMENT_FEED_QUERY, {
        variables: {
            request: { commentsOf: publicationId },
            reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
            profileId: currentUser?.id ?? null
        },
        skip: !publicationId,
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            console.log(data)
            setComments(data?.publications?.items)
            console.log('[Query]', `Fetched first 10 comments of Publication:${publicationId}`)
        },
        onError: (error) => {
            console.error('[Query Error]', error)
        }
    })
    return (
        <div className='flex flex-col'>
            {comments?.map((comment, index) => (

                <CommentFeed key={index} comment={comment} />
            ))

            }
        </div>
    )
}

export default CommentFeeds