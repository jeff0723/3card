import React, { useEffect, useState } from 'react'
import { Message, ListMessagesQuery, CreateMessageMutation } from "API"
import GraphQLAPI, { graphqlOperation } from '@aws-amplify/api-graphql'
import { listMessages } from 'graphql/amplify/queries'
import { createMessage } from 'graphql/amplify/mutations'
import { onCreateMessageByConversationId } from 'graphql/amplify/subscriptions'

import { useAccount } from 'wagmi'
import { API } from 'aws-amplify'
import SingleMessage from './SingleMessage'

type Props = {
    conversationId: string
    peerAddress: string
}

const MessageBox = ({ conversationId, peerAddress }: Props) => {

    const { address } = useAccount()
    const [stateMessages, setStateMessages] = useState<Message[]>([])
    const [message, setMesaage] = useState("")
    useEffect(() => {
        const subscription = API.graphql({
            query: onCreateMessageByConversationId,
            variables: {
                conversationId: conversationId
            }
        });
        if ('subscribe' in subscription) {
            const sb = subscription.subscribe({
                next: ({ provider, value }: any) => {
                    console.log(value)
                    setStateMessages(
                        (stateMessages) =>
                            [...stateMessages,
                            value.data.onCreateMessageByConversationId
                            ]
                    )
                },
                error: (error: any) => {
                    console.log(error)
                }
            });
        }
    }, []);
    useEffect(() => {
        const fechtMessages = async () => {
            const { data } = await GraphQLAPI.graphql(
                {
                    query: listMessages,
                    variables: {
                        filter: { conversationId: { eq: conversationId } }
                    },
                }) as { data: ListMessagesQuery }
            setStateMessages(data.listMessages?.items as Message[] || [])
        }
        fechtMessages()

    }, [conversationId])
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMesaage(e.target.value)
    }
    const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!message) return
        try {
            const { data } = await GraphQLAPI.graphql({
                query: createMessage,
                variables: {
                    input: {
                        conversationId: conversationId,
                        body: message,
                        sender: address,
                        receiver: peerAddress,
                    }
                }
            }) as { data: CreateMessageMutation }
            console.log(data)
        } catch (e) {
            console.log(e)
        } finally {
            setMesaage("")
        }
    }
    console.log("state messages:", stateMessages)

    return (
        <div className='h-full py-4 flex flex-col justify-end '>
            <div className='h-[700px] flex flex-col overflow-y-auto gap-2 py-4'>
                {stateMessages
                    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                    .map((item, index) => (
                        <SingleMessage
                            message={item.body}
                            user={address}
                            isMe={item.sender === address}
                            updateAt={item.updatedAt}
                        />
                    ))}
            </div>
            {/* <div className='flex justify-between py-2 px-2 border border-[#2F3336]'> */}
            <form className='flex justify-between py-2 px-2' onSubmit={handleSend}>
                <input placeholder='Start a new message' onChange={handleChange} value={message}
                    className='bg-black focus:outline-none' />
                <button type='submit' className='text-primary-blue'>SEND</button>
            </form>
            {/* </div> */}
        </div>
    )
}

export default MessageBox