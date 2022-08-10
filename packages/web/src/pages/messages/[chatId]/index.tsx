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
import { CURRENT_USER_QUERY } from 'graphql/query/user'
import { useQuery } from '@apollo/client'

interface Props {

}
const profile = {
    name: "John Doe",
    handle: "@johndoe",
    avatar: "https://ipfs.io/ipfs/QmPJqhBrLwRucVfwbtH6F2h1ratAA85c33F6mh228Ztzwg"

}

const index: NextPage<Props> = () => {
    const { address } = useAccount()
    const { query: { chatId } } = useRouter()
    const [peerAddress, setPeerAddress] = useState("")
    const [avatar, setAvatar] = useState("")
    const [name, setName] = useState("")
    const [handle, setHandle] = useState("")
    useEffect(() => {
        if (address && chatId?.includes('-')) {
            //@ts-ignore
            const list = chatId.split('-')
            const peer = list.find((item: string) => item !== address)
            setPeerAddress(peer)
        }
    }, [address])
    const { data, loading, error } =
        useQuery(CURRENT_USER_QUERY, {
            variables: { ownedBy: [peerAddress] },
            onCompleted(data) {
                setAvatar(data?.profiles?.items[0]?.picture?.original?.url)
                setName(data?.profiles?.items[0]?.name)
                setHandle(data?.profiles?.items[0]?.handle)
            }
        })
    return (
        <div className='grid grid-cols-3 w-full'>
            <div className='col-span-1 flex flex-col overflow-y-auto border border-transparent border-r-[#2F3336]'>
                <Sidebar />
            </div>
            <div className='col-span-2 flex'>
                <div className='w-full flex flex-col px-4'>
                    <div className='flex gap-2 items-center h-[53px]'>
                        <div>
                            {avatar && <img src={avatar} className='rounded-full w-8 h-8' />}
                            {!avatar && <div className="rounded-full loading w-8 h-8" />}

                        </div>
                        <div>
                            {name || handle && <><div className='font-bold text-[20px]'>{name}</div>
                                <div className='text-gray-400'>{handle}</div></>}
                            {!name && !handle && <div className="rounded-lg loading w-32 h-4" />}

                        </div>
                    </div>
                    <MessageBox conversationId={chatId as string} peerAddress={peerAddress} />
                </div>
            </div>
        </div>

    )
}

export default index