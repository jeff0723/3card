import { useQuery } from '@apollo/client'
import { GET_PROFILE_BY_ADDRESS } from 'graphql/query/user'
import React, { useState } from 'react'
import getIPFSLink from 'utils/getIPFSLink'

type Props = {
    address: string
}

const AvatarByAddress = ({ address }: Props) => {

    const [avatar, setAvatar] = useState("")
    const { data, loading, error } =
        useQuery(GET_PROFILE_BY_ADDRESS, {
            variables: { ownedBy: [address] },
            onCompleted(data) {
                console.log("[Query complete]", data)
                setAvatar(getIPFSLink(data?.profiles?.items[0]?.picture?.original?.url))
            }
        })

    return (
        (loading ? <div className='w-10 h-10 loading rounded-full' /> : <img src={avatar} className='w-10 h-10 rounded-full' />)
    )
}

export default AvatarByAddress