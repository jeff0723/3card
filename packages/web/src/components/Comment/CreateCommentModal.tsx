import Modal from 'components/UI/Modal';
import React, { useState } from 'react'
import { FiX } from 'react-icons/fi';
import { useAppSelector } from 'state/hooks';
import { RiImage2Line } from 'react-icons/ri'
import { FaGlobeAsia } from 'react-icons/fa'
import { AiOutlineFileGif } from 'react-icons/ai'
import { BiCommentDetail } from 'react-icons/bi'
import Button from 'components/UI/Button';
import styled from 'styled-components';
import { useForm } from "react-hook-form";
import toast from 'react-hot-toast';
import { EnabledModule, CreateCommentBroadcastItemResult, Publication, MediaSet, NftImage, Profile } from 'generated/types'
import { useSignTypedData } from 'wagmi';
import { uploadIpfs } from 'utils/uploadToIPFS';
import { v4 as uuid } from 'uuid'
import { PublicationMainFocus, PublicationMetadata } from 'types/publication-metadata';
import { APP_NAME, LENSHUB_PROXY } from 'constants/constants';
import { useMutation } from '@apollo/client';
import { CREATE_POST_TYPED_DATA_MUTATION } from 'graphql/mutation/create-post';
import { Spinner } from 'components/UI/Spinner';
import { usePrepareContractWrite, useContractWrite } from 'wagmi'
import { LensHubProxy } from 'abis/LensHubProxy';
import { BROADCAST_MUTATION } from 'graphql/mutation/broadcast-mutation';
import omit from 'utils/omit';
import splitSignature from 'utils/splitSignature';
import getIPFSLink from 'utils/getIPFSLink';
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { CREATE_COMMENT_TYPED_DATA_MUTATION } from 'graphql/mutation/create-comment';
import { Mixpanel } from 'utils/Mixpanel';

dayjs.extend(relativeTime)

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    post: Publication & { profile: Profile & { picture: MediaSet & NftImage } }
    setCount: (count: number) => void;
    count: number;
}

type FormValues = {
    content: string;
};
const CreateCommentModal = ({ open, setOpen, post, setCount, count }: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser)
    const [commentInput, setCommentInput] = useState<string | null>("")
    const [selectedModule, setSelectedModule] =
        useState<EnabledModule>()
    const [onlyFollowers, setOnlyFollowers] = useState<boolean>(false)
    const [isUploading, setIsUploading] = useState<boolean>(false)
    const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
        onError(error) {
            toast.error("User rejected denied message signature")
        }
    })
    const { data,
        isLoading: writeLoading,
        write,
    } = useContractWrite(
        {
            addressOrName: LENSHUB_PROXY,
            contractInterface: LensHubProxy,
            functionName: 'commentWithSig',
            mode: 'recklesslyUnprepared',
            onSuccess: async (data) => {
                const { wait, hash } = data
                setCount(count + 1)
                setOpen(false)
                setCommentInput("")
                toast.success('Successfully sent transaction: ' + hash)
                Mixpanel.track("publication.comment", { result: 'success' })
                toast.promise(
                    wait(),
                    {
                        loading: 'Comment creating...',
                        success: (data) => {
                            if (data.status) {
                                return `Comment created successfully`
                            } else {
                                return `Comment creation failed`
                            }
                        },
                        error: (err) => `This just happened: ${err.toString()}`,
                    }

                )

            },
            onError: (error) => {
                toast.error(error?.message)
                Mixpanel.track("publication.comment", { result: 'error' })

            }
        })

    const [createCommentTypedData, { loading: typedDataLoading }] = useMutation(
        CREATE_COMMENT_TYPED_DATA_MUTATION, {
        onCompleted: async ({ createCommentTypedData }: { createCommentTypedData: CreateCommentBroadcastItemResult }) => {
            const { id, typedData } = createCommentTypedData


            const {
                profileId,
                profileIdPointed,
                pubIdPointed,
                contentURI,
                collectModule,
                collectModuleInitData,
                referenceModule,
                referenceModuleData,
                referenceModuleInitData,
                deadline
            } = typedData?.value

            try {
                const signature = await signTypedDataAsync({
                    domain: omit(typedData?.domain, '__typename'),
                    types: omit(typedData?.types, '__typename'),
                    value: omit(typedData?.value, '__typename')
                })
                const { v, r, s } = splitSignature(signature)
                const sig = { v, r, s, deadline }
                const inputStruct = {
                    profileId,
                    profileIdPointed,
                    pubIdPointed,
                    contentURI,
                    collectModule,
                    collectModuleInitData,
                    referenceModule,
                    referenceModuleData,
                    referenceModuleInitData,
                    sig
                }
                const {
                    data: { broadcast: result }
                } = await broadcast({ variables: { request: { id, signature } } })

                if ('reason' in result)
                    write?.({ recklesslySetUnpreparedArgs: inputStruct })

            } catch (error) {
                console.warn('[Sign Error]', error)
            }

        },
        onError: (error) => {
            console.log(error)
            setIsUploading(false)

        }
    }
    )


    const [broadcast, { data: broadcastData, loading: broadcastLoading }] =
        useMutation(BROADCAST_MUTATION, {
            onCompleted: (data) => {
                console.log('broadcast completed', data)
                toast.success('Comment created successfully')
                Mixpanel.track("publication.comment", { result: 'succcess' })
                setCount(count + 1)
                setOpen(false)
                setCommentInput("")
            },
            onError(error) {
                // if (error.message === ERRORS.notMined) {
                //   toast.error(error.message)
                // }
                console.error('[Broadcast Error]', error)
                Mixpanel.track("publication.comment", { result: 'broadcast_error' })
            }
        })
    const createComment = async () => {
        if (!commentInput) return
        setIsUploading(true)
        const publicationMetaData: PublicationMetadata = {
            version: '1.0.0',
            metadata_id: uuid(),
            description: commentInput,//TODO: add trimify (figure out why)
            content: commentInput,
            external_url: "",
            name: `[3card] Comment by @${currentUser?.handle}`,
            mainContentFocus: PublicationMainFocus.TEXT_ONLY,
            attributes: [
                {
                    traitType: 'string',
                    value: 'comment'
                }
            ],
            createdAt: new Date(),
            appId: APP_NAME
        }
        const { path } = await uploadIpfs(publicationMetaData).finally(() => setIsUploading(false))
        createCommentTypedData({
            variables: {
                request: {
                    profileId: currentUser?.id,
                    publicationId: post?.id,
                    contentURI: `https://ipfs.infura.io/ipfs/${path}`,
                    collectModule: {
                        freeCollectModule: {
                            followerOnly: false
                        }
                    },
                    referenceModule: {
                        followerOnlyReferenceModule: false
                    }
                }
            }
        })
    }

    return (
        <Modal open={open} onClose={() => { setOpen(false) }} size={'lg'}>
            <div className='flex flex-col gap-2'>
                <div className='flex justify-end'>
                    <div onClick={() => { setOpen(false) }} className='inline-flex justify-center items-center w-8 h-8 rounded-full hover:bg-primary-blue hover:bg-opacity-30 hover:text-sky-400' >
                        <FiX className="text-[20px] " />
                    </div>
                </div>
                <div className='flex flex-col'>
                    <div className="flex gap-4">
                        <div className='flex flex-col'>
                            <img src={getIPFSLink(post?.profile?.picture?.original?.url)} alt="" className="w-10 h-10 rounded-full" />
                            <div className='w-full h-full flex justify-center'>
                                <div className='bg-gray-300 border-[0.8px] -my-[4px] border-[#333639]'></div>
                            </div>
                        </div>
                        <div className='flex flex-col pb-4 '>
                            <div className='flex gap-2'>
                                <div>{post?.profile?.name}</div>
                                <div className='text-gray-400'>@{post.profile?.handle} · {dayjs(new Date(post?.createdAt)).fromNow()}</div>
                            </div>
                            <div className='text-[15px]'>
                                {post?.metadata?.content}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">

                        <img src={getIPFSLink(currentUser?.picture?.original.url)} alt="" className="w-10 h-10 rounded-full" />
                        <div className='flex flex-col w-full gap-2 '>
                            <div className='min-h-[90px]  max-h-[600px] overflow-y-auto h-fit justify-center items-center ' >
                                <div
                                    contentEditable='true'
                                    placeholder="Type your reply"
                                    className='py-4 w-full h-full bg-transparent border-none outline-none text-[20px] break-all'
                                    onInput={(e) => setCommentInput(e.currentTarget?.innerText)} />

                            </div>
                            <div className='border-b border-border-gray' />
                            <div className='flex justify-between items-center'>
                                <div className='flex text-[20px] text-primary-blue items-center gap-[10px]'>
                                    <RiImage2Line />
                                    <AiOutlineFileGif />
                                    <FaGlobeAsia />
                                </div>
                                <Button className='w-15' onClick={createComment}
                                    disabled={
                                        !commentInput
                                        || isUploading
                                        || writeLoading
                                        || typedDataLoading
                                        || signLoading}
                                    icon={
                                        (
                                            isUploading
                                            || writeLoading
                                            || typedDataLoading
                                            || signLoading)
                                        && <Spinner size='sm' />}>
                                    {isUploading || writeLoading || signLoading ?
                                        (writeLoading ?
                                            "Confirming" :
                                            (signLoading ?
                                                "Signing" :
                                                "Uploading")) :
                                        "Comment"
                                    }
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default CreateCommentModal