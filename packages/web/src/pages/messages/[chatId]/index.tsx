import React, { useEffect, useState } from 'react'
import type { NextPage, GetServerSideProps } from 'next'
import Sidebar from 'components/Message/Sidebar'
import Button from 'components/UI/Button'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import MessageBox from 'components/Message/MessageBox'
import GraphQLAPI from '@aws-amplify/api-graphql'
import { listMessages } from 'graphql/amplify/queries'
import { Message, ListMessagesQuery } from "API"

interface Props {
    messages: Message[]

}
const profile = {
    name: "John Doe",
    handle: "@johndoe",
    avatar: "https://ipfs.io/ipfs/QmPJqhBrLwRucVfwbtH6F2h1ratAA85c33F6mh228Ztzwg"

}
const index: NextPage<Props> = ({ messages }) => {
    const { address } = useAccount()
    const { query: { chatId } } = useRouter()
    const [peerAddress, setPeerAddress] = useState("")
    const [conversationId, setConversationId] = useState("")
    useEffect(() => {
        if (address && chatId?.includes('-')) {
            //@ts-ignore
            const list = chatId.split('-')
            const peer = list.find((item: string) => item !== address)
            setPeerAddress(peer)
        }
        if (chatId) {
            setConversationId(chatId as string)
        }
    }, [address])
    if (chatId?.includes('-')) {

    }
    console.log(chatId)
    console.log("messages:", messages)
    return (
        <div className='grid grid-cols-3 w-full'>
            <div className='col-span-1 flex flex-col overflow-y-auto border border-transparent border-r-[#2F3336]'>
                <Sidebar />
            </div>
            <div className='col-span-2 flex'>
                <div className='w-full flex flex-col px-4'>
                    <div className='flex gap-2 items-center h-[53px]'>
                        <div>
                            <img src={profile.avatar} className='rounded-full w-8 h-8' />
                        </div>
                        <div>
                            <div className='font-bold text-[20px]'>{profile.name}</div>
                            <div className='text-gray-400'>{profile.handle}</div>
                        </div>
                    </div>
                    <MessageBox conversationId={conversationId} peerAddress={peerAddress} messages={messages} />
                </div>
            </div>
        </div>

    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { query: { chatId } } = context
    const { data } = await GraphQLAPI.graphql(
        {
            query: listMessages,
            variables: {
                filter: { conversationId: { eq: chatId } }
            },
        }) as { data: ListMessagesQuery }
    return {
        props: {
            messages: data.listMessages?.items
        },
    }
}
export default index