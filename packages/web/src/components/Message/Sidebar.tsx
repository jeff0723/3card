import React, { FC, ReactNode } from 'react'
import { FaPlus } from 'react-icons/fa'
interface Props {
    children: ReactNode
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
const Sidebar: FC<Props> = ({ children }) => {
    return (
        <div className='grid grid-cols-3 w-full'>
            <div className='col-span-1 flex flex-col overflow-y-scroll'>
                <div className='flex justify-between items-center px-4 bg-black'>
                    <div className='font-semibold text-[20px]'>Messages</div>
                    <FaPlus className='text-[20px]' />
                </div>
                {messagesList.map((item, index) => (
                    <div className='flex gap-2 p-4 '>
                        <div>
                            <img src={item.avatar} className='rounded-full w-12 h-12' />
                        </div>
                        <div className='flex flex-col'>
                            <div>{item.name} <span className='text-gray-400'>{item.handle} · {item.lastUpdated}</span></div>
                            <div>{item.lastMessage}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className='col-span-2 flex'>
                {children}
            </div>
        </div>
    )
}

export default Sidebar