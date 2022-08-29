import React, { useState } from 'react'
import { useAppSelector } from 'state/hooks'
import { Notification, PaginatedResultInfo } from 'generated/types'
import { useQuery } from '@apollo/client'
import { NOTIFICATIONS_QUERY } from 'graphql/query/notification-query'
import FollowerNotification from './FollowerNotification'
import CollectNotfication from './CollectNotfication'
import MirrorNotification from './MirrorNotification'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Spinner } from 'components/UI/Spinner'
import Search from 'components/Home/Search'
import NewsFeed from 'components/Home/NewsFeed'
import MentionNotification from './MentionNotification'

type Props = {}

const Notifications = (props: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
    const { data, loading, error, fetchMore } = useQuery(NOTIFICATIONS_QUERY, {
        variables: {
            request: { profileId: currentUser?.id, limit: 10 }
        },
        fetchPolicy: 'no-cache',
        onCompleted(data) {
            setPageInfo(data?.notifications?.pageInfo)
            setNotifications(data?.notifications?.items)
            console.log('[Query]', `Fetched first 10 notifications`)
        },
        onError(error) {
            console.error('[Query Error]', error)
        }
    })
    const fetchMoreData = async () => {
        const { data } = await fetchMore({
            variables: {
                request: {
                    profileId: currentUser?.id,
                    cursor: pageInfo?.next,
                    limit: 10
                }
            }
        })
        setPageInfo(data?.notifications?.pageInfo)
        setNotifications([...notifications, ...data?.notifications?.items])
        console.log(
            '[Query]',
            `Fetched next 10 notifications Next:${pageInfo?.next}`
        )
    }

    return (
        <div className='grid grid-cols-3 w-full '>
            <div className='col-span-2 divide-y divide-border-gray overflow-scroll no-scrollbar border-r border-border-gray' >
                <div className='p-4 text-[20px] font-bold'>
                    Notifications
                </div>
                <div id='scrollableDiv' className='overflow-y-auto no-scrollbar h-screen' >
                    <InfiniteScroll
                        dataLength={notifications.length}
                        next={fetchMoreData}
                        loader={<div className='flex justify-center'><Spinner size='md' /></div>}
                        hasMore={pageInfo?.next && pageInfo?.totalCount && notifications.length !== pageInfo?.totalCount}
                        endMessage={<h4>Nothing more to show</h4>}
                        scrollableTarget="scrollableDiv"
                        className='divide-y divide-border-gray'
                    >
                        {notifications?.map((notification: Notification, index: number) => (
                            <div key={index} className="pl-10 pt-5 pb-5 pr-5">
                                {notification?.__typename === 'NewFollowerNotification' && (
                                    <FollowerNotification notification={notification as any} />
                                )}
                                {notification?.__typename === 'NewMentionNotification' && (
                                    <MentionNotification notification={notification as any} />
                                )}
                                {/* {notification?.__typename === 'NewCommentNotification' && (
                       <CommentNotification notification={notification} />
                     )} */}
                                {notification?.__typename === 'NewMirrorNotification' && (
                                    <MirrorNotification notification={notification} />
                                )}
                                {notification?.__typename === 'NewCollectNotification' && (
                                    <CollectNotfication notification={notification as any} />
                                )}
                            </div>
                        ))}
                    </InfiniteScroll>
                </div>
            </div>
            <div className='flex flex-col gap-2 col-span-1 p-4'>
                <Search />
                <NewsFeed height='70vh' />
            </div>

        </div >
    )
}

export default Notifications