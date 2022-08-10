import React, { Fragment, useState, ChangeEvent, MouseEvent } from 'react'
import Button from 'components/UI/Button'
import { Dialog, Transition } from '@headlessui/react'
import { FiX } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { setIsNewMessageModalOpen } from 'state/application/reducer';
import { useAccount } from 'wagmi';
import GraphQLAPI from '@aws-amplify/api-graphql';
import { listConversations } from 'graphql/amplify/queries';
import { createConversation } from 'graphql/amplify/mutations'
import { Spinner } from 'components/UI/Spinner';
import { CreateConversationMutation, ListConversationsQuery } from 'API';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

type Props = {}

const NewMessageModal = (props: Props) => {
    const router = useRouter()
    const isOpen = useAppSelector(state => state.application.isNewMessageModalOpen)
    const dispatch = useAppDispatch()
    const { address } = useAccount()
    const [loading, setLoading] = useState(false)
    const [searchInput, setSearchInput] = useState("")
    const handleChanges = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value)
    }
    const closeModal = () => {
        dispatch(setIsNewMessageModalOpen({ isNewMessageModalOpen: false }))
    }
    const isButtonEnable = address !== undefined && searchInput.length > 0

    const creaeteNewConversation = async () => {
        if (searchInput && address) {
            try {
                setLoading(true)
                const { data: query } = await GraphQLAPI.graphql({
                    query: listConversations,
                    variables: {
                        filter: {
                            or: { conversationId: { eq: `${address}-${searchInput}` } }, conversationId: { eq: `${searchInput}-${address}` }
                        }
                    }
                }) as { data: ListConversationsQuery }
                let converstaionId;

                if (query.listConversations?.items.length === 0) {
                    converstaionId = `${address}-${searchInput}`
                    const { data: mutation } = await GraphQLAPI.graphql({
                        query: createConversation,
                        variables: {
                            input: {
                                conversationId: converstaionId,
                                participants: [address, searchInput]
                            }
                        }
                    }) as { data: CreateConversationMutation }
                    if (mutation.createConversation?.conversationId) {
                        router.push(`/messages/${converstaionId}`)
                    }
                }
                else {
                    converstaionId = query.listConversations?.items[0]?.conversationId
                    router.push(`/messages/${converstaionId}`)
                }
            } catch (e) {
                toast.error("Something went wrong")
            } finally {
                setLoading(false)
            }
        }
    }
    console.log("loading:", loading)
    console.log(isButtonEnable)
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-75" />
                </Transition.Child>

                <div className="fixed top-[50px] inset-x-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >

                            <Dialog.Panel className="border border-white border-opacity-20 w-full max-w-md transform overflow-hidden rounded-2xl bg-black p-6 text-left align-middle shadow-xl transition-all">

                                <div className='flex justify-between items-center'>
                                    <div className='flex items-center gap-2 '>

                                        <button
                                            className='inline-flex justify-center items-center w-8 h-8 rounded-full'
                                            onClick={closeModal}>
                                            <FiX className='text-lg ' />
                                        </button>
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-white"
                                        >
                                            New Message

                                        </Dialog.Title>
                                    </div>
                                    <Button
                                        disabled={!isButtonEnable}
                                        onClick={creaeteNewConversation}
                                        icon={loading && <Spinner size='xs' />}
                                    >
                                        Next
                                    </Button>
                                </div>
                                <div className='flex flex-col gap-4 mt-4 px-4'>
                                    <input
                                        value={searchInput}
                                        onChange={handleChanges}
                                        placeholder='Search...'
                                        className="fborder border-none bg-black focus:outline-none" />
                                </div>

                                <div className="mt-4">
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default NewMessageModal