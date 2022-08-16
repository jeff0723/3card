import React from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { PUBLICATION_QUERY } from 'graphql/query/publication-query'
import { useQuery } from '@apollo/client'
import { useAppSelector } from 'state/hooks'

type Props = {}

const index: NextPage = (props: Props) => {
    const { query: { post_id } } = useRouter()
    const currentUser = useAppSelector(state => state.user.currentUser)
    const { data, loading, error } = useQuery(PUBLICATION_QUERY, {
        variables: {
            request: { publicationId: post_id },
            reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
            profileId: currentUser?.id ?? null
        },
        skip: !post_id,
        onCompleted: (data) => {
            console.log('[Query]', `Fetched publication details Publication:${data}`)
        },
        onError: (error) => {
            console.error('[Query Error]', error)
        }
    })
    return (
        <div>index</div>
    )
}

export default index