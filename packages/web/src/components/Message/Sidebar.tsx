import React, { FC, ReactNode, useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { setIsNewMessageModalOpen } from 'state/application/reducer';
import { ListConversationsQuery, Conversation, UpdateConversationMutation } from 'API';
import GraphQLAPI from '@aws-amplify/api-graphql';
import { listConversations } from 'graphql/amplify/queries';
import { useAccount } from 'wagmi';
import ConversationCard from './ConversationCard';
import NewMessageModal from './NewMessageModal';
import { API } from "aws-amplify";
import { GraphQLSubscription, GraphQLQuery } from "@aws-amplify/api";
import { onUpdateConversation } from 'graphql/amplify/subscriptions';


interface Props {
}
const messageChannel = {
    id: "1-2",
    name: "John Doe",
    handle: "@johndoe",
    lastMessage: "Hello, how are you?",
    lastUpdated: "1 hour ago",
    avatar: "https://ipfs.io/ipfs/QmPJqhBrLwRucVfwbtH6F2h1ratAA85c33F6mh228Ztzwg"
}
const messagesList = Array(100).fill(messageChannel)
const Sidebar: FC<Props> = () => {
    const { address } = useAccount()
    const dispatch = useAppDispatch()
    const openModal = () => {
        dispatch(setIsNewMessageModalOpen({ isNewMessageModalOpen: true }))
    }
    const [conversations, setConversations] = useState<Conversation[]>([])

    useEffect(() => {
        const listConversationQuery = async () => {
            const { data } = await GraphQLAPI.graphql({
                query: listConversations,
                variables: {
                    filter: { participants: { contains: address } }
                }
            }) as { data: ListConversationsQuery }

            setConversations(data.listConversations?.items as Conversation[] || [])
        }
        listConversationQuery()
        console.log(conversations)
        //     conversations.forEach(conversation => {
        //         const subscription = API.graphql<GraphQLSubscription<UpdateConversationMutation>>({
        //             query: onUpdateConversation,
        //             variables: {
        //                 conversationId: conversation.conversationId,
        //                 lastMessage: conversation.lastMessage,
        //             }
        //         }).subscribe({
        //             next: (event: any) => {
        //                 console.log(event.value)
        //             },
        //             error: (error: any) => {
        //                 console.log(error)
        //             }
        //         });
        //         return () => {
        //             subscription.unsubscribe();
        //         }
        //     })
    }, [address])
    return (
        <div>
            <div className='flex justify-between items-center px-4 bg-black'>
                <div className='font-semibold text-[20px]'>Messages</div>
                <div onClick={openModal}>
                    <FaPlus className='text-[20px]' />
                </div>
            </div>
            {conversations.map((item, index) => (
                <ConversationCard
                    key={index}
                    conversationId={item.conversationId}
                    participants={item.participants}
                    lastMessage={item.lastMessage}
                    updateAt={item.updatedAt}
                />
            ))}
            <NewMessageModal />
        </div>
    )
}

export default Sidebar