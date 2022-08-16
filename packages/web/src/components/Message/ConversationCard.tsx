import { useLazyQuery, useQuery } from '@apollo/client'
import { GET_PROFILES } from 'graphql/query/profile'
import { CURRENT_USER_QUERY } from 'graphql/query/user'
import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Link from 'next/link'
import { API } from "aws-amplify";
import { GraphQLSubscription } from '@aws-amplify/api';
import { Conversation } from 'API'
import { onUpdateConversationByConversationId } from 'graphql/amplify/subscriptions'


dayjs.extend(relativeTime)
type Props = {
  conversationId: string
  participants: string[]
  lastMessage?: string | null
  updateAt: string
}

const ConversationCard = ({ conversationId, participants, lastMessage, updateAt }: Props) => {
  const { address } = useAccount()
  const user = participants.filter((value) => value !== address)[0]
  const [avatar, setAvatar] = useState("")
  const [name, setName] = useState("")
  const [handle, setHandle] = useState("")
  const [conversationLastMessage, setConversationLastMessage] = useState("")
  useEffect(() => {
    if (lastMessage) setConversationLastMessage(lastMessage)
    const subscription = API.graphql<GraphQLSubscription<Conversation>>({
      query: onUpdateConversationByConversationId,
      variables: {
        conversationId: conversationId
      }
    }).subscribe({
      next: (event: any) => {
        setConversationLastMessage(event.value.data.onUpdateConversationByConversationId.lastMessage)
      },
      error: (error: any) => {
        console.log(error)
      }
    });
    return () => {
      subscription.unsubscribe();
    }
  }, [lastMessage]);

  const { data, loading, error } =
    useQuery(CURRENT_USER_QUERY, {
      variables: { ownedBy: [user] },
      onCompleted(data) {
        console.log("[Query complete]", data)
        setAvatar(data?.profiles?.items[0]?.picture?.original?.url)
        setName(data?.profiles?.items[0]?.name)
        setHandle(data?.profiles?.items[0]?.handle)
      }
    })
  return (
    <Link href={`/messages/${conversationId}`}>
      <div className='flex gap-2 p-4 '>
        <div>
          {!avatar && <div className="rounded-full loading w-12 h-12" />}
          {avatar && <img src={avatar} className='rounded-full w-12 h-12' />}
        </div>
        <div className='flex flex-col'>
          <div>{name} <span className='text-gray-400'>@{handle} · {dayjs(new Date(updateAt)).fromNow()}</span></div>
          <div className='text-gray-500'>{conversationLastMessage}</div>
        </div>
      </div>
    </Link>
  )
}

export default ConversationCard