import React, { useEffect, useState } from 'react'
import type { NextPage, GetServerSideProps } from 'next'
import Sidebar from 'components/Message/Sidebar'
import Button from 'components/UI/Button'
import Router, { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import MessageBox from 'components/Message/MessageBox'
import GraphQLAPI from '@aws-amplify/api-graphql'
import { listMessages } from 'graphql/amplify/queries'
import { Message, ListMessagesQuery } from "API"
import { useLazyQuery, useQuery } from '@apollo/client'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { SEARCH_USERS_QUERY } from 'graphql/query/search-user';
import { GET_PROFILE_BY_ADDRESS } from 'graphql/query/user'

import getIPFSLink from 'utils/getIPFSLink'
import Cookies from 'js-cookie'
import { current } from '@reduxjs/toolkit'
import { Spinner } from 'components/UI/Spinner'

interface Props {
}


const ChatPage: NextPage<Props> = () => {
    const { address } = useAccount()
    const currentUser = useAppSelector(state => state.user.currentUser)
    const { query: { chatId } } = useRouter()
    const router = useRouter()
    const [peerAddress, setPeerAddress] = useState("")
    const [avatar, setAvatar] = useState("")
    const [name, setName] = useState("")
    const [handle, setHandle] = useState("")
    const [messages, setMessages] = useState<Message[]>()
    const [loading, setLoading] = useState(false)
    const [checkSuccess, setCheckSuccess] = useState(false)
    const isApplicationLoading = useAppSelector(state => state.application.isApplicationLoading)
    const [getProfileByAddress, { error: errorProfiles, loading: profilesLoading }] =
        useLazyQuery(GET_PROFILE_BY_ADDRESS,
            {
                onCompleted(data) {
                    console.log("[Lazy query completed]", data)
                }
            })

    const getMessages = async () => {
        const { data } = await GraphQLAPI.graphql({
            query: listMessages,
            variables: {
                filter: {
                    conversationId: {
                        eq: chatId
                    }
                },
                limit: 500
            }
        }) as { data: ListMessagesQuery }
        const messages = data?.listMessages?.items as Message[]
        setMessages(messages)

    }
    const checkIfInConversation = async () => {
        if (!currentUser && !isApplicationLoading) {
            router.push("/")
            return
        }
        if (currentUser && chatId?.includes('-')) {
            //@ts-ignore
            const list = chatId.split('-')
            if (!list.includes(currentUser.ownedBy)) {
                router.push("/messages")
                return
            }
            const peer = list.find((item: string) => item !== currentUser.ownedBy)
            const { data: profilesData } = await getProfileByAddress({
                variables: { ownedBy: peer },
            });
            if (profilesData?.profiles?.items?.length == 0) {
                router.push("/messages")
                return
            }

            setPeerAddress(peer)
            setCheckSuccess(true)

        }
    }

    useEffect(() => {
        const updateProfile = async () => {
            const { data } = await getProfileByAddress({
                variables: { ownedBy: peerAddress },
            });
            setAvatar(data?.profiles?.items[0]?.picture?.original?.url)
            setName(data?.profiles?.items[0]?.name)
            setHandle(data?.profiles?.items[0]?.handle)
        }
        updateProfile()
    }, [peerAddress, getProfileByAddress])


    useEffect(() => {
        checkIfInConversation()
    }, [chatId, address, getProfileByAddress, currentUser, isApplicationLoading])
    useEffect(() => {
        setLoading(true)
        if (checkSuccess) {
            getMessages().finally(() => setLoading(false))
        }
    }, [checkSuccess, chatId])


    return (
        <div className='grid grid-cols-3 w-full'>
            <div className='col-span-1 flex flex-col overflow-y-auto border border-transparent border-r-[#2F3336]'>
                <Sidebar />
            </div>
            <div className='col-span-2 flex overflow-y-auto'>
                <div className='w-full flex flex-col px-4'>
                    <div className='flex gap-2 items-center h-[53px]'>
                        <div>
                            {avatar && <img src={avatar} className="rounded-full w-8 h-8" alt={name} />}
                            {!avatar && <div className="rounded-full loading w-8 h-8" />}

                        </div>
                        <div>
                            {name || handle && <><div className='font-bold text-[20px]'>{name}</div>
                                <div className='text-gray-400'>{handle}</div></>}
                            {!name && !handle && <div className="rounded-lg loading w-32 h-4" />}

                        </div>
                    </div>
                    {
                        !loading && messages && <MessageBox messages={messages} conversationId={chatId as string} peerAddress={peerAddress} />
                    }
                    {
                        loading &&
                        <div className='flex h-screen justify-center items-center'><Spinner size='lg' /></div>
                    }

                </div>
            </div>
        </div>

    )
}


export default ChatPage