import React from 'react'
import { Spinner } from "components/UI/Spinner";
import { Fragment, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAppSelector } from "state/hooks";
import styled from "styled-components";
import CreateProfileHelper from "./CreateProfileHelper";
import Feed from "./Feed";
import RecommendUser from "./RecommendUser";
import { HiPlus } from 'react-icons/hi'
import Modal from "components/UI/Modal";
import { FiX } from "react-icons/fi";
import { HiPencilAlt, HiUserGroup } from 'react-icons/hi'
import CreatePost from "./CreatePost";
import { Dialog, Transition } from "@headlessui/react";
import { Domain } from "domain";
import CreateCommunity from './CreateCommunit';
type Props = {}
const CreateButton = (props: Props) => {
    const [createPostOpen, setCreatePostOpen] = useState(false)
    const [optionShow, setOptionShow] = useState(false)
    const [creaetCommunityOpen, setCreateCommunityOpen] = useState(false)
    return (
        <>
            <div className="absolute flex flex-col bottom-5 right-10 gap-2">
                <Transition appear show={optionShow} as={Fragment}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2  items-center pr-2">
                                <div className="h-10 w-20 flex items-center justify-center">Post</div>
                                <div className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex justify-center items-center hover:bg-opacity-20"
                                    onClick={() => setCreatePostOpen(true)}>
                                    <HiPencilAlt className="text-[20px] text-gray-500" />
                                </div>
                            </div>
                            <div className="flex gap-2 items-center pr-2">
                                <div className="h-10 w-20  flex items-center justify-center">Community</div>
                                <div className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex justify-center items-center hover:bg-opacity-20"
                                    onClick={() => setCreateCommunityOpen(true)}>
                                    <HiUserGroup className="text-[20px] text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </Transition.Child>
                </Transition>
                <div className="flex justify-end">
                    <button
                        className="flex items-center justify-center w-14 h-14 rounded-full bg-primary-blue bg-opacity-30 text-[20px] text-sky-400 hover:bg-opacity-50 disabled:bg-opacity-50"
                        onClick={() => { setOptionShow(!optionShow) }}>
                        <HiPlus />
                    </button>
                </div>
            </div>
            <CreatePost open={createPostOpen} setOpen={setCreatePostOpen} />
            <CreateCommunity open={creaetCommunityOpen} setOpen={setCreateCommunityOpen} />

        </>
    )
}

export default CreateButton