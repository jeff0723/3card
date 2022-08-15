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
import { EnabledModule, CreatePostBroadcastItemResult } from 'generated/types'
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

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
}

type FormValues = {
    content: string;
};
const CreatePost = ({ open, setOpen }: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser)
    const [postInput, setPostInput] = useState<string | null>("")
    const [selectedModule, setSelectedModule] =
        useState<EnabledModule>()
    const [onlyFollowers, setOnlyFollowers] = useState<boolean>(false)
    const [isUploading, setIsUploading] = useState<boolean>(false)
    const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
        onError(error) {
            toast.error(error?.message)
        }
    })
    const { data,
        isLoading: writeLoading,
        write,
    } = useContractWrite(
        {
            addressOrName: LENSHUB_PROXY,
            contractInterface: LensHubProxy,
            functionName: 'post',
            mode: 'recklesslyUnprepared',
            onSuccess: async (data) => {
                const { wait, hash } = data
                setOpen(false)
                setPostInput("")
                toast.success('Successfully sent transaction: ' + hash)
                toast.promise(
                    wait(),
                    {
                        loading: 'Post creating...',
                        success: (data) => {
                            if (data.status) {
                                return `Post created successfully`
                            } else {
                                return `Post creation failed`
                            }
                        },
                        error: (err) => `This just happened: ${err.toString()}`,
                    }

                )

            },
            onError: (error) => {
                toast.error(error?.message)
            }
        })

    const [createPostTypedData, { loading: typedDataLoading }] = useMutation(
        CREATE_POST_TYPED_DATA_MUTATION, {
        onCompleted: async ({ createPostTypedData }: { createPostTypedData: CreatePostBroadcastItemResult }) => {
            // console.log(createPostTypedData)
            const { id, typedData } = createPostTypedData
            const {
                profileId,
                contentURI,
                collectModule,
                collectModuleInitData,
                referenceModule,
                referenceModuleInitData,
                deadline
            } = typedData?.value
            // const inputStruct = {
            //     profileId,
            //     contentURI,
            //     collectModule,
            //     collectModuleInitData,
            //     referenceModule,
            //     referenceModuleInitData,
            // }
            // console.log("typedData:", typedData)
            // if (write) {
            //     console.log("Start to write")
            //     write({ recklesslySetUnpreparedArgs: inputStruct })
            // }
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
                    contentURI,
                    collectModule,
                    collectModuleInitData,
                    referenceModule,
                    referenceModuleInitData,
                    sig
                }
                const {
                    data: { broadcast: result }
                } = await broadcast({ variables: { request: { id, signature } } })
                console.log("broadcast result:", result)
                if ('reason' in result) write?.({ recklesslySetUnpreparedArgs: inputStruct })


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
            },
            onError(error) {
                // if (error.message === ERRORS.notMined) {
                //   toast.error(error.message)
                // }
                console.error('[Broadcast Error]', error)
            }
        })
    const createPost = async () => {
        if (!postInput) return
        setIsUploading(true)
        const publicationMetaData: PublicationMetadata = {
            version: '1.0.0',
            metadata_id: uuid(),
            description: postInput,//TODO: add trimify (figure out why)
            content: postInput,
            external_url: "",
            name: `[3card] Post by @${currentUser?.handle}`,
            mainContentFocus: PublicationMainFocus.TEXT_ONLY,
            attributes: [
                {
                    traitType: 'string',
                    value: 'post'
                }
            ],
            createdAt: new Date(),
            appId: APP_NAME
        }
        const { path } = await uploadIpfs(publicationMetaData).finally(() => setIsUploading(false))
        createPostTypedData({
            variables: {
                request: {
                    profileId: currentUser?.id,
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
                <div className="flex gap-4">
                    <div>
                        <img src={currentUser?.picture?.original.url} alt="" className="w-10 h-10 rounded-full" />
                    </div>
                    <div className='flex flex-col w-full gap-2 '>
                        <div className='min-h-[90px]  max-h-[600px] overflow-y-auto h-fit justify-center items-center ' >
                            <div
                                contentEditable='true'
                                placeholder="What's in your mind"
                                className=' w-full h-full bg-transparent border-none outline-none text-[20px] break-all'
                                onInput={(e) => setPostInput(e.currentTarget?.innerText)} />

                        </div>
                        <div className='border-b border-border-gray' />
                        <div className='flex justify-between items-center'>
                            <div className='flex text-[20px] text-primary-blue items-center gap-[10px]'>
                                <RiImage2Line />
                                <AiOutlineFileGif />
                                <FaGlobeAsia />
                            </div>
                            <Button className='w-15' onClick={createPost}
                                disabled={
                                    !postInput
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
                                    "Post"
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default CreatePost