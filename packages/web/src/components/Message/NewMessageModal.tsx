import { useLazyQuery } from '@apollo/client';
import GraphQLAPI from '@aws-amplify/api-graphql';
import { Dialog, Transition } from '@headlessui/react';
import { CreateConversationMutation, ListConversationsQuery } from 'API';
import clsx from 'clsx';
import Button from 'components/UI/Button';
import { Spinner } from 'components/UI/Spinner';
import UserProfile from 'components/UI/UserProfile';
import { MediaSet, NftImage, Profile } from 'generated/types';
import { createConversation } from 'graphql/amplify/mutations';
import { listConversations } from 'graphql/amplify/queries';
import { SEARCH_USERS_QUERY } from 'graphql/query/search-user';
import { GET_PROFILE_BY_ADDRESS } from 'graphql/query/user';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChangeEvent, Fragment, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiX } from "react-icons/fi";
import { HiOutlineX, HiSearch } from 'react-icons/hi';
import { setIsNewMessageModalOpen } from 'state/application/reducer';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { useAccount } from 'wagmi';
type Props = {}

const NewMessageModal = (props: Props) => {
    const router = useRouter()
    const isOpen = useAppSelector(state => state.application.isNewMessageModalOpen)
    const dispatch = useAppDispatch()
    const { address } = useAccount()
    const [loading, setLoading] = useState(false)
    const [searchInput, setSearchInput] = useState("")
    const [searchByHandle, setSearchByHandle] = useState(false)
    const [profile, setProfile] = useState<Profile>()
    const dropdownRef = useRef(null)

    const handleChanges = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value)
    }
    const closeModal = () => {
        dispatch(setIsNewMessageModalOpen({ isNewMessageModalOpen: false }))
    }
    const isButtonEnable = address !== undefined && searchInput.length > 0

    const createNewConversation = async () => {
        if (!searchInput) return
        if (searchInput && address) {
            if (!profile) { alert("Please select a user below!") }
            let opponentAddress = profile?.ownedBy
            console.log(opponentAddress)
            if (opponentAddress && address) {
                let converstaionId = (BigInt(address) > BigInt(opponentAddress)) ? `${address}-${opponentAddress}` : `${opponentAddress}-${address}`
                console.log(converstaionId)
                try {
                    setLoading(true)
                    const { data: query } = await GraphQLAPI.graphql({
                        query: listConversations,
                        variables: {
                            filter: {
                                conversationId: { eq: converstaionId }
                            }
                        }
                    }) as { data: ListConversationsQuery }
                    console.log(query.listConversations?.items.length)
                    if (query.listConversations?.items.length !== 0) {
                        closeModal()
                        router.push(`/messages/${converstaionId}`)
                    }
                    if (query.listConversations?.items.length === 0) {
                        const { data: mutation } = await GraphQLAPI.graphql({
                            query: createConversation,
                            variables: {
                                input: {
                                    conversationId: converstaionId,
                                    participants: [address, opponentAddress]
                                }
                            }
                        }) as { data: CreateConversationMutation }
                        if (mutation.createConversation?.conversationId) {
                            closeModal()
                            router.push(`/messages/${converstaionId}`)
                        }
                    }
                } catch (e) {
                    toast.error("Something went wrong")
                    console.log(e)
                } finally {
                    setLoading(false)
                }
            }
        }

    }
    const [searchUsers, { data: searchUsersData, loading: searchUsersLoading }] =
        useLazyQuery(SEARCH_USERS_QUERY, {
            onCompleted(data) {
                if (data?.search?.items?.length > 0) setSearchByHandle(true)
                console.log(data)
                console.log(
                    '[Lazy Query]',
                    `Fetched ${data?.search?.items?.length} search result for ${searchInput}`
                )
            }
        })
    const [getProfileByAddress, { data: userData, loading: profilesLoading }] =
        useLazyQuery(GET_PROFILE_BY_ADDRESS,
            {
                onCompleted(data) {
                    console.log("[Lazy query completed]", data)
                    console.log(data.profiles.items.length)
                }
            })

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value
        setSearchInput(keyword)
        searchUsers({
            variables: { request: { type: 'PROFILE', query: keyword, limit: 8 } }
        })
        if (searchByHandle == false) {
            getProfileByAddress({
                variables: { ownedBy: keyword }
            })
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
                                        onClick={createNewConversation}
                                        icon={loading && <Spinner size='xs' />}
                                    >
                                        Next
                                    </Button>
                                </div>
                                {/* <div className='flex flex-col gap-4 mt-4 px-4'>
                                    <input
                                        value={searchInput}
                                        onChange={handleChanges}
                                        placeholder='Search...'
                                        className="fborder border-none bg-black focus:outline-none" />
                                </div> */}
                                <div className='w-full'>
                                    <div className='flex items-center justify-between text-lg w-full rounded-lg px-3 py-2 mt-4'>
                                        <div className='flex gap-2 items-center'>
                                            <HiSearch />
                                            <input value={profile ? profile?.handle : searchInput} className='pl-2 bg-transparent outline-none text-[15px]' placeholder='Search...' onChange={handleSearch} />
                                        </div>
                                        <div className={clsx(
                                            'cursor-pointer',
                                            searchInput ? 'visible' : 'invisible'
                                        )} onClick={() => {
                                            setSearchInput('')
                                        }}>
                                            <HiOutlineX />

                                        </div>

                                    </div>
                                    {searchInput.length > 0 && (<div
                                        className="flex flex-col mt-2 w-full"
                                        ref={dropdownRef}
                                    >
                                        <div className="bg-black rounded-xl  overflow-y-auto py-2 max-h-[80vh]">
                                            {searchUsersLoading ? (
                                                <div className="py-2 px-4 space-y-2 text-sm font-bold text-center">
                                                    <Spinner size="sm" className="mx-auto" />
                                                    <div>Searching users</div>
                                                </div>
                                            ) : (
                                                <>
                                                    {searchUsersData?.search?.items?.map((profile: Profile & { picture: MediaSet & NftImage }) => (
                                                        <div
                                                            key={profile?.handle}
                                                            className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        >
                                                            <div onClick={() => {
                                                                setProfile(profile)
                                                            }}>

                                                                <UserProfile profile={profile} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {userData?.profiles?.items?.map((profile: Profile & { picture: MediaSet & NftImage }) => (
                                                        <div
                                                            key={profile?.handle}
                                                            className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        >
                                                            <div onClick={() => {
                                                                setProfile(profile)
                                                            }}>

                                                                <UserProfile profile={profile} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {searchUsersData?.search?.items?.length === 0 && userData?.profiles?.items?.length === 0 && (
                                                        <div className="py-2 px-4">No matching users</div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>)}
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