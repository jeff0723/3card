import { useQuery } from '@apollo/client'
import { ProfileSortCriteria, Profile, PaginatedResultInfo } from 'generated/types'
import { EXPLORE_PROFILES } from 'graphql/query/explore-profile'
import Link from 'next/link'
import React, { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useAppSelector } from 'state/hooks'


type Props = {}

const index = (props: Props) => {

    const [users, setUsers] = useState<Profile[]>([])
    const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
    const [pageCount, setPageCount] = useState(0)
    const { loading, error, data, fetchMore } = useQuery(EXPLORE_PROFILES, {
        variables: {
            request: {
                sortCriteria: "MOST_POSTS",
            }
        },
        onCompleted: (data) => {
            console.log("[Query Result]: ", data)
            setUsers(data.exploreProfiles.items)
            setPageInfo(data.exploreProfiles.pageInfo)
            setPageCount(data.exploreProfiles.pageInfo.totalCount)
        },
        onError: (error) => {
            console.error("[Query Error]: ", error)
        }
    }
    )
    const fetchMoreData = async () => {
        try {
            const { data } = await fetchMore({
                variables: {
                    request: {
                        sortCriteria: "MOST_POSTS",
                        cursor: pageInfo?.next,
                    },
                },
            })
            setPageInfo(data?.exploreProfiles?.pageInfo)
            setUsers([...users, ...data?.exploreProfiles?.items])
            console.log(
                '[Query]',
                `Fetched next 20 users`
            )
        } catch (err) {
            console.error("[Query Error]: ", err)
        }
    }


    return (

        <div>
            <InfiniteScroll
                dataLength={users.length}
                next={fetchMoreData}
                hasMore={users.length < pageCount}
                loader={<div>loading</div>}
                endMessage={<h4>Nothing more to show</h4>}
            >
                <div className='flex flex-col gap-4'>
                    {users.map((user) => (
                        <Link href={`/user/${user.handle}`} key={user.id}>
                            <div className="flex items-center cursor-pointer gap-2">
                                <div>@{user.name}</div>
                                <div>Posts: {user.stats.totalPosts}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </InfiniteScroll>
        </div>
    )
}

export default index