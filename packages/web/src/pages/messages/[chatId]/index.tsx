import React from 'react'
import type { NextPage } from 'next'
import Sidebar from 'components/Message/Sidebar'
import Button from 'components/UI/Button'
import { useRouter } from 'next/router'

type Props = {}
const profile = {
    name: "John Doe",
    handle: "@johndoe",
    avatar: "https://ipfs.io/ipfs/QmPJqhBrLwRucVfwbtH6F2h1ratAA85c33F6mh228Ztzwg"

}
const index: NextPage = (props: Props) => {
    const { query: { chatId } } = useRouter()
    return (
        <Sidebar >
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
                Message id: {chatId}</div>
        </Sidebar>
    )
}

export default index