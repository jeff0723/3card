import { useRouter } from 'next/router'
import React from 'react'
import type { NextPage } from 'next'
import { COMMUNITY_QUERY } from 'graphql/query/community-query'
import { useQuery } from '@apollo/client'
import Button from 'components/UI/Button'
import { useAppSelector } from 'state/hooks'
import { RiImage2Line } from 'react-icons/ri'
import { BiUpvote, BiDownvote } from 'react-icons/bi'
import { HiOutlineHeart, HiOutlineSwitchHorizontal, HiOutlineBookmark } from "react-icons/hi";
import { BsChat } from "react-icons/bs";
type Props = {}

const Community: NextPage = (props: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser)
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
    return (
        <div className='w-full'>
            <div className='grid grid-cols-9 w-full'>
                <div className='flex flex-col gap-4 col-start-3 col-span-5 h-full'>
                    <div className='flex justify-between py-4 border-b border-border-gray'>
                        <div className='flex gap-2'>
                            <img src={data.publication?.metadata?.cover?.original?.url} className='w-20 h-20 rounded-full' />
                            <div className='flex flex-col justify-end'>
                                <div className='text-[20px]'>{data.publication?.metadata?.name}</div>
                                <div className='text-[15px]'>{data.publication?.metadata?.description}</div>
                                <div className='flex gap-2 text-gray-400'>
                                    <div>{data.publication?.stats?.totalAmountOfCollects} posts</div>
                                    <div>{data.publication?.stats?.totalAmountOfComments} members</div>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col justify-end'>
                            <Button>Join</Button>
                        </div>
                    </div>
                    <div className='flex gap-2 items-center p-2 border border-border-gray'>
                        <img src={currentUser?.picture?.original?.url} className='w-10 h-10 rounded-full' />
                        <div contentEditable placeholder='Create a post...' className='w-full p-4 outline-none' />
                        <div className='flex items-center gap-2'>
                            <RiImage2Line className='text-[20px] text-primary-blue' />
                            <div className='text-primary-blue font-bold p-2 rounded-lg hover:text-sky-400 hover:bg-primary-blue hover:bg-opacity-30'>POST</div>
                        </div>
                    </div>
                    <div className='flex flex-col'>
                        <div className='flex gap-4 py-4 border-b border-border-gray'>
                            <div className='flex flex-col items-center gap-2'>
                                <div>
                                    <BiUpvote className='text-[20px] text-green-400' />
                                </div>
                                <div>10</div>
                                <div>
                                    <BiDownvote className='text-[20px] text-red-400' />
                                </div>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <div className='text-gray-400'>Posted by @jeff0723.lens 8 hours ago</div>
                                <div className='text-[20px] font-bold'>This is a test for community </div>
                                <div>I spent couple hours to code up this page. However, the result seems only ok. I don't know how to fix it.</div>
                                <div className='flex gap-4 text-[20px]'>
                                    <div className='flex gap-2'><BsChat /> <div className='text-[13px]'>5</div></div>

                                    <div className='flex gap-2'><HiOutlineBookmark /><div className='text-[13px]'> 4</div></div>

                                </div>
                            </div>
                        </div>
                        <div className='flex gap-4 py-4 border-b border-border-gray'>
                            <div className='flex flex-col items-center gap-2'>
                                <div>
                                    <BiUpvote className='text-[20px] text-green-400' />
                                </div>
                                <div>10</div>
                                <div>
                                    <BiDownvote className='text-[20px] text-red-400' />
                                </div>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <div className='text-gray-400'>Posted by @jeff0723.lens 8 hours ago</div>
                                <div className='text-[20px] font-bold'>This is a test for community </div>
                                <div>I spent couple hours to code up this page. However, the result seems only ok. I don't know how to fix it.</div>
                                <div className='flex gap-4 text-[20px]'>
                                    <div className='flex gap-2'><BsChat /> <div className='text-[13px]'>5</div></div>

                                    <div className='flex gap-2'><HiOutlineBookmark /><div className='text-[13px]'> 4</div></div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Community