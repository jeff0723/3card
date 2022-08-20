import { useQuery } from '@apollo/client'
import CommentFeeds from 'components/Comment/CommentFeeds'
import Button from 'components/UI/Button'
import { Spinner } from 'components/UI/Spinner'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Publication } from 'generated/types'
import { PUBLICATION_QUERY } from 'graphql/query/publication-query'
import type { NextPage, GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { BiArrowBack } from 'react-icons/bi'
import { BsChat } from "react-icons/bs"
import { HiOutlineBookmark, HiOutlineHeart, HiOutlineSwitchHorizontal } from "react-icons/hi"
import { useAppSelector } from 'state/hooks'
import getIPFSLink from 'utils/getIPFSLink'

dayjs.extend(relativeTime)

type Props = {}

const Post: NextPage = (props: Props) => {
    const router = useRouter()
    const { post_id } = router.query
    const [publication, setPublication] = useState<Publication>()
    const currentUser = useAppSelector(state => state.user.currentUser)
    const { data, loading, error } = useQuery(PUBLICATION_QUERY, {
        variables: {
            request: { publicationId: post_id },
            reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
            profileId: currentUser?.id ?? null
        },
        skip: !post_id,
        onCompleted: (data) => {
            setPublication(data?.publication)
            console.log('[Query]', `Fetched publication details Publication:${data}`)
        },
        onError: (error) => {
            console.error('[Query Error]', error)
        }
    })
    useEffect(() => {
        if (data) {
            setPublication(data?.publication)
        }
    }, [data])
    if (!publication || loading) return (
        <div className='flex w-full justify-center'>
            <Spinner size='lg' />
        </div>
    )
    return (
        <div className='grid grid-cols-3 w-full'>
            <div className='col-span-2 flex flex-col px-4 h-full overflow-auto no-scrollbar border-r border-border-gray'>
                <div className='flex gap-4 w-full items-center pb-4'>
                    <div onClick={() => router.back()} className='w-8 h-8 rounded-full flex justify-center items-center text-[20px] hover:bg-primary-blue hover:bg-opacity-30 hover:text-sky-400'>
                        <BiArrowBack />
                    </div>
                    <div className='text-[20px] font-bold'>
                        Post
                    </div>
                </div>
                <div className='flex justify-between items-center'>


                    <div className='flex gap-2'>
                        <img
                            //@ts-ignore
                            src={getIPFSLink(publication?.profile?.picture?.original?.url)} className='w-12 h-12 rounded-full' />
                        <div className='flex flex-col text-[15px]'>
                            <div className='font-bold'>{publication?.profile?.name}</div>
                            <div className='text-gray-400'>@{publication?.profile?.handle}</div>
                        </div>
                    </div>
                    <div className='text-[13px] text-gray-400'>
                        {publication && dayjs(new Date(publication?.createdAt)).fromNow()}
                    </div>

                </div>
                <div className='text-[20px] py-4'>
                    {publication && publication?.metadata?.content}
                </div>
                <div className='flex justify-around py-4 border-b border-border-gray text-gray-400'>
                    <div className='flex items-center gap-1'><BsChat className='text-[20px]' /> <div className='text-[15px]'>{publication?.stats?.totalAmountOfComments}</div></div>
                    <div className='flex items-center gap-1'><HiOutlineHeart className='text-[20px]' /><div className='text-[15px]'> {publication?.stats?.totalUpvotes}</div></div>
                    <div className='flex items-center gap-1'><HiOutlineSwitchHorizontal className='text-[20px]' /><div > {publication?.stats?.totalAmountOfMirrors}</div></div>
                    <div className='flex items-center gap-1'><HiOutlineBookmark className='text-[20px]' /><div className='text-[15px]'> {publication?.stats?.totalAmountOfComments}</div></div>
                </div>
                {currentUser && <div className='flex justify-between items-center py-4 border-b border-border-gray'>
                    <div className='flex items-start gap-2'>
                        <img src={getIPFSLink(currentUser?.picture?.original?.url)} className='w-12 h-12 rounded-full' />
                        <div contentEditable className='text-[20px] outline-none py-3' placeholder='Write your reply' />
                    </div>
                    <div>
                        <Button>
                            Reply
                        </Button>
                    </div>
                </div>}

                <CommentFeeds publicationId={publication?.id} />

            </div>
            <div className='col-span-1'>sidebar</div>


        </div >
    )
}


export default Post