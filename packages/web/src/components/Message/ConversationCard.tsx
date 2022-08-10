import { useLazyQuery, useQuery } from '@apollo/client'
import { GET_PROFILES } from 'graphql/query/profile'
import { CURRENT_USER_QUERY } from 'graphql/query/user'
import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Link from 'next/link'
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
  console.log(data)
  console.log(user)
  console.log("loading", loading)
  return (
    <Link href={`/messages/${conversationId}`}>
      <div className='flex gap-2 p-4 '>
        <div>
          <img src={avatar} className='rounded-full w-12 h-12' />
        </div>
        <div className='flex flex-col'>
          <div>{name} <span className='text-gray-400'>@{handle} · {dayjs(new Date(updateAt)).fromNow()}</span></div>
          <div>{lastMessage}</div>
        </div>
      </div>
    </Link>
  )
}

export default ConversationCard