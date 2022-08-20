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
import { EnabledModule, CreatePostBroadcastItemResult, MetadataDisplayType } from 'generated/types'
import { useSignTypedData } from 'wagmi';
import { uploadAssetToIpfs, uploadIpfs } from 'utils/uploadToIPFS';
import { v4 as uuid } from 'uuid'
import { PublicationMainFocus, PublicationMetadata, PublicationMetadataDisplayType } from 'types/publication-metadata';
import { APP_NAME, LENSHUB_PROXY } from 'constants/constants';
import { useMutation } from '@apollo/client';
import { CREATE_POST_TYPED_DATA_MUTATION } from 'graphql/mutation/create-post';
import { Spinner } from 'components/UI/Spinner';
import { usePrepareContractWrite, useContractWrite } from 'wagmi'
import { LensHubProxy } from 'abis/LensHubProxy';
import { BROADCAST_MUTATION } from 'graphql/mutation/broadcast-mutation';
import omit from 'utils/omit';
import splitSignature from 'utils/splitSignature';
import { makeStorageClient } from 'utils/web3-storage';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
}

type FormValues = {
    name: string;
    description: string;
    category: string;
};
const CreateCommunity = ({ open, setOpen }: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser)
    const [postInput, setPostInput] = useState<string | null>("")
    const [avatar, setAvatar] = useState("")
    const [imageUploading, setImageUploading] = useState(false)
    const [previewImage, setPreviewImage] = useState("")
    const { register, handleSubmit, getValues } = useForm<FormValues>();

    const [selectedModule, setSelectedModule] =
        useState<EnabledModule>()
    const [onlyFollowers, setOnlyFollowers] = useState<boolean>(false)

    const [isUploading, setIsUploading] = useState<boolean>(false)
    const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
        onError(error) {
            toast.error(error?.message)
        }
    })
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setImageUploading(true)
        if (e.target?.files) {
            try {
                // this part should be adjusted
                // const _cid = await uploadAssetToIpfs(e.target.files[0])
                const client = makeStorageClient()
                const filename = uuid() + ".png"
                const file = new File([e.target.files[0]], filename)
                const cid = await client.put([file])
                setAvatar(`https://ipfs.infura.io/${cid}/${filename}`)
            } finally {
                const objectUrl = URL.createObjectURL(e.target.files[0])
                setPreviewImage(objectUrl)
                setImageUploading(false)
            }
        }

    }
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
                        loading: 'Community creating...',
                        success: (data) => {
                            if (data.status) {
                                return `Community created successfully`
                            } else {
                                return `Community creation failed`
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
    const onSubmit = handleSubmit(async (data) => {

        const publicationMetaData: PublicationMetadata = {
            version: '1.0.0',
            metadata_id: uuid(),
            description: data.description,//TODO: add trimify (figure out why)
            content: data.description,
            external_url: "",
            name: data.name,
            image: avatar,
            mainContentFocus: PublicationMainFocus.ARTICLE,
            attributes: [
                {
                    traitType: 'string',
                    key: "type",
                    value: 'community'
                },
                {
                    traitType: 'string',
                    key: "category",
                    value: data.category
                }
            ],
            createdAt: new Date(),
            appId: `${APP_NAME} Community`,
            tags: ["NFT"]
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
    })

    return (
        <Modal open={open} onClose={() => { setOpen(false) }} size='md'>
            <div className='flex flex-col gap-2'>
                <div className='flex justify-between items-center'>
                    <div className='text-[20px] font-bold'>
                        Create a Community
                    </div>
                    <div onClick={() => { setOpen(false) }} className='inline-flex justify-center items-center w-8 h-8 rounded-full hover:bg-primary-blue hover:bg-opacity-30 hover:text-sky-400' >
                        <FiX className="text-[20px] " />
                    </div>
                </div>

                <form className='flex flex-col w-full gap-2 p-4' onSubmit={onSubmit}>
                    <div className='flex flex-col gap-1'>
                        <label>
                            Name
                        </label>
                        <input placeholder='Name your community' className='p-4 bg-black rounded-lg border border-border-gray focus:outline-primary-blue'
                            {...register('name', { required: true })} />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label>
                            Description
                        </label>
                        <textarea placeholder='What is it for...' className='p-4 bg-black rounded-lg border border-border-gray focus:outline-primary-blue'
                            {...register('description', { required: true })} />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label>Categories</label>
                        <select className='p-4 bg-black rounded-lg border border-border-gray focus:outline-primary-blue' placeholder='Choose a category' {...register('category', { required: true })}>
                            <option value="GENERAL">General</option>
                            <option value="NFT">NFT</option>
                            <option value="DAO">DAO</option>
                            <option value="DEFI">DeFi</option>

                        </select>
                    </div>
                    <div className='flex flex-col'>
                        <label>
                            Avatar
                        </label>
                        <div className='flex justify-between items-center'>
                            <input type='file' accept="image/*" className='p-4 rounded-lg focus:outline-none' onChange={handleUpload} />
                            {imageUploading && <Spinner size='sm' />}
                        </div>
                        {avatar && <img src={previewImage} className='w-20 h-20' />}
                    </div>
                    <Button className='mt-20 w-15' type='submit'
                        disabled={
                            !avatar ||
                            imageUploading ||
                            typedDataLoading ||
                            broadcastLoading ||
                            isUploading}
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
                            "Create"
                        }
                    </Button>
                </form>
            </div>
        </Modal >
    )
}

export default CreateCommunity