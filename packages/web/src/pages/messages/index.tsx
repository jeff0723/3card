import React, { Fragment, useState } from 'react'
import type { NextPage } from 'next'
import Sidebar from 'components/Message/Sidebar'
import Button from 'components/UI/Button'
import { Dialog, Transition } from '@headlessui/react'
import { FiX } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from 'state/hooks';

import { setIsNewMessageModalOpen } from 'state/application/reducer';
import NewMessageModal from 'components/Message/NewMessageModal'

type Props = {}

const ChatHome: NextPage = (props: Props) => {

    const dispatch = useAppDispatch()
    const openModal = () => {
        dispatch(setIsNewMessageModalOpen({ isNewMessageModalOpen: true }))
    }


    return (
        <div className='grid grid-cols-3 w-full'>
            <div className='col-span-1 flex flex-col overflow-y-auto border border-transparent border-r-[#2F3336]'>
                <Sidebar />
            </div>
            <div className='col-span-2 flex'>
                <div className='w-full flex justify-center items-center'>
                    <div className='flex flex-col gap-4 w-[300px]'>
                        <div>
                            <div className='font-bold text-[32px]'>Select a message</div>
                            <p className='text-gray-400 text-[15px]'>Choose from your existing conversations, or start a new one.</p>
                        </div>
                        <div>
                            <Button onClick={openModal}> New Message</Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ChatHome