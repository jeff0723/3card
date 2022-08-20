import { useMutation } from '@apollo/client';
import Tippy from '@tippyjs/react';
import { LensPeriphery } from 'abis/LensPeriphery';
import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';
import { Spinner } from 'components/UI/Spinner';
import { APP_NAME, LENS_PERIPHERY } from 'constants/constants';
import { CreateSetProfileMetadataUriBroadcastItemResult } from 'generated/types';
import { BROADCAST_MUTATION } from 'graphql/mutation/broadcast-mutation';
import { CREATE_SET_PROFILE_METADATA_TYPED_DATA_MUTATION } from 'graphql/mutation/set-profile-metadata-url-mutation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';
import { HiCamera } from 'react-icons/hi';
import { useAppSelector } from 'state/hooks';
import 'tippy.js/dist/tippy.css';
import getAttribute from 'utils/getAttribute';
import getIPFSLink from 'utils/getIPFSLink';
import omit from 'utils/omit';
import splitSignature from 'utils/splitSignature';
import { uploadIpfs } from 'utils/uploadToIPFS';
import { makeStorageClient } from 'utils/web3-storage';
import { v4 as uuid } from 'uuid';
import { useContractWrite, useSignTypedData } from 'wagmi';
import UpdateProfileImageDialog from './UpdateProfileImageDialog';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
}
type FormValues = {
    name: string;
    bio: string;
    location: string;
    website: string;
    twitter: string;
};
const EditProfileModal = ({ open, setOpen }: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser)
    //@ts-ignore
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>(currentUser?.coverPicture?.original?.url)
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>(currentUser?.picture?.original?.url)
    //@ts-ignore
    const [coverUrl, setCoverUrl] = useState<string>(currentUser?.coverPicture?.original?.url)
    const [photoUrl, setPhotoUrl] = useState<string>(currentUser?.picture?.original?.url)
    const [isUploading, setIsUploading] = useState<boolean>(false)
    const [coverUploading, setCoverUploading] = useState<boolean>(false)
    const [photoUploading, setPhotoUploading] = useState<boolean>(false)
    const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
        onError(error) {
            toast.error(error?.message)
        }
    })
    const [updateImageOpen, setUpdateImageOpen] = useState<boolean>(false)
    useEffect(() => {
        //@ts-ignore
        setCoverPreviewUrl(currentUser?.coverPicture?.original?.url)
        setPhotoPreviewUrl(currentUser?.picture?.original?.url)
        //@ts-ignore
        setCoverUrl(currentUser?.coverPicture?.original?.url)
        setPhotoUrl(currentUser?.picture?.original?.url)
    }, [currentUser])
    const { data,
        isLoading: writeLoading,
        write,
    } = useContractWrite(
        {
            addressOrName: LENS_PERIPHERY,
            contractInterface: LensPeriphery,
            functionName: 'setProfileMetadataURIWithSig',
            mode: 'recklesslyUnprepared',
            onSuccess: async (data) => {
                const { wait, hash } = data
                setOpen(false)
                toast.success('Successfully sent transaction: ' + hash)
                toast.promise(
                    wait(),
                    {
                        loading: 'Updating profile...',
                        success: (data) => {
                            if (data.status) {
                                return `Profile update successfully`
                            } else {
                                return `Profile update failed`
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
    const [createSetProfileMetadataTypedData, { loading: typedDataLoading }] = useMutation(
        CREATE_SET_PROFILE_METADATA_TYPED_DATA_MUTATION, {
        onCompleted: async ({ createSetProfileMetadataTypedData }: { createSetProfileMetadataTypedData: CreateSetProfileMetadataUriBroadcastItemResult }) => {

            const { id, typedData } = createSetProfileMetadataTypedData
            const { deadline, profileId, metadata } = typedData?.value

            try {
                const signature = await signTypedDataAsync({
                    domain: omit(typedData?.domain, '__typename'),
                    types: omit(typedData?.types, '__typename'),
                    value: omit(typedData?.value, '__typename')
                })
                const { v, r, s } = splitSignature(signature)
                const sig = { v, r, s, deadline }
                const inputStruct = {
                    user: currentUser?.ownedBy,
                    profileId,
                    metadata,
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
    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setCoverUploading(true)
        if (e.target?.files) {
            try {
                // this part should be adjusted
                // const _cid = await uploadAssetToIpfs(e.target.files[0])

                const client = makeStorageClient()
                const filename = uuid() + ".png"
                const file = new File([e.target.files[0]], filename)
                const cid = await client.put([file])
                setCoverUrl(`https://ipfs.infura.io/ipfs/${cid}/${filename}`)
            } finally {
                const objectUrl = URL.createObjectURL(e.target.files[0])
                setCoverPreviewUrl(objectUrl)
                setCoverUploading(false)
            }
        }

    }
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setPhotoUploading(true)
        if (e.target?.files) {
            try {
                // this part should be adjusted
                // const _cid = await uploadAssetToIpfs(e.target.files[0])
                const client = makeStorageClient()
                const filename = uuid() + ".png"
                const file = new File([e.target.files[0]], filename)
                const cid = await client.put([file])
                setPhotoUrl(`https://ipfs.infura.io/ipfs/${cid}/${filename}`)
                const objectUrl = URL.createObjectURL(e.target.files[0])
                setPhotoPreviewUrl(objectUrl)
            } finally {

                setPhotoUploading(false)
                setUpdateImageOpen(true)
            }
        }
    }
    const { register, getValues } = useForm<FormValues>(
        {
            defaultValues: {
                name: currentUser?.name as string,
                bio: currentUser?.bio as string,
                location: getAttribute(currentUser?.attributes, 'location') as string,
                website: getAttribute(currentUser?.attributes, 'website') as string,
                twitter: getAttribute(currentUser?.attributes, 'twitter') as string,
            },
        }
    );

    const onSumbit = async () => {
        const name = getValues('name')
        const bio = getValues('bio')
        const location = getValues('location')
        const website = getValues('website')
        const twitter = getValues('twitter')
        setIsUploading(true)
        const { path } = await uploadIpfs({
            name,
            bio,
            cover_picture: coverUrl ? coverUrl : null,
            attributes: [
                {
                    traitType: 'string',
                    key: 'location',
                    value: location
                },
                {
                    traitType: 'string',
                    key: 'website',
                    value: website
                },
                {
                    traitType: 'string',
                    key: 'twitter',
                    value: twitter
                },
                {
                    traitType: 'string',
                    key: 'app',
                    value: APP_NAME
                }
            ],
            version: '1.0.0',
            metadata_id: uuid(),
            previousMetadata: currentUser?.metadata,
            createdOn: new Date(),
            appId: APP_NAME
        }).finally(() => setIsUploading(false))

        createSetProfileMetadataTypedData({
            variables: {
                request: {
                    profileId: currentUser?.id,
                    metadata: `https://ipfs.infura.io/ipfs/${path}`
                }
            }
        })
    }
    return (
        <Modal open={open} onClose={() => { setOpen(false) }} size='lg'>

            <div className='flex justify-between items-center'>
                <div className='flex gap-4 items-center'>
                    <div onClick={() => { setOpen(false) }} className='inline-flex justify-center items-center w-8 h-8 rounded-full hover:bg-primary-blue hover:bg-opacity-30 hover:text-sky-400' >
                        <FiX className="text-[20px] " />
                    </div>
                    <div className='text-[20px] font-bold'> Edit Profile</div>
                </div>
                <Button onClick={onSumbit} disabled={isUploading || writeLoading || signLoading || typedDataLoading}
                    icon={
                        (isUploading || writeLoading || signLoading || typedDataLoading) && <Spinner size='xs' />
                    }> Save</Button>
            </div>
            <div className='h-40 bg-black mt-4 flex justify-center items-center' style={{
                //@ts-ignore
                backgroundImage: `url(${getIPFSLink(coverPreviewUrl)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
            }}>

                {coverUploading ? <Spinner size='md' />
                    : <Tippy content="Add photo" placement='bottom'>
                        <div className='w-10 h-10 bg-[#0f1419] bg-opacity-75 hover:bg-opacity-20 hover:bg-white rounded-full flex justify-center items-center backdrop-blur-sm'>
                            <label htmlFor='file-upload-cover'>
                                <HiCamera className='text-[20px]' />
                            </label>
                            <input disabled={coverUploading} id='file-upload-cover' type='file' name='file' accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />

                        </div>
                    </Tippy>}


            </div>
            <div className='w-28 h-28 -mt-14 object-cover rounded-full flex justify-center items-center'
                style={{
                    //@ts-ignore
                    backgroundImage: `url(${getIPFSLink(photoPreviewUrl)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                    opacity: '0.75'
                }} >
                {photoUploading ? <Spinner size='md' /> :
                    <Tippy content="Add photo" placement='bottom'>
                        <div className='w-10 h-10 bg-[#0f1419] bg-opacity-75 hover:bg-opacity-20 hover:bg-white rounded-full flex justify-center items-center backdrop-blur-sm'>
                            <label htmlFor='file-upload-photo'>
                                <HiCamera className='text-[20px]' />
                            </label>
                            <input disabled={photoUploading} id='file-upload-photo' type='file' name='file' accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />

                        </div>
                    </Tippy>}
            </div>
            <form className='flex flex-col gap-2 mt-4'>
                <div className='flex flex-col'>
                    <label>Name</label>
                    <input type='text' placeholder='Your name' className='p-4 bg-black rounded-lg border border-border-gray focus:outline-primary-blue'
                        {...register('name')}>
                    </input>
                </div>
                <div className='flex flex-col'>
                    <label>Bio</label>
                    <textarea placeholder='Your bio' className='p-4 bg-black rounded-lg border border-border-gray focus:outline-primary-blue'
                        {...register('bio')}>
                    </textarea>
                </div>
                <div className='flex flex-col'>
                    <label>Location</label>
                    <input type='text' placeholder='Your location' className='p-4 bg-black rounded-lg border border-border-gray focus:outline-primary-blue'
                        {...register('location')}>
                    </input>
                </div>
                <div className='flex flex-col'>
                    <label>Website</label>
                    <input type='text' placeholder='Your website url' className='p-4 bg-black rounded-lg border border-border-gray focus:outline-primary-blue'
                        {...register('website')}>
                    </input>
                </div>
                <div className='flex flex-col'>
                    <label>Twitter</label>
                    <input type='text' placeholder='Your twitter handle' className='p-4 bg-black rounded-lg border border-border-gray focus:outline-primary-blue'
                        {...register('twitter')}>
                    </input>
                </div>
            </form>
            <UpdateProfileImageDialog open={updateImageOpen} setOpen={setUpdateImageOpen} avatar={photoUrl} setPhotoPreviewUrl={setPhotoPreviewUrl} />
        </Modal >
    )
}

export default EditProfileModal