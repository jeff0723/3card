import React from 'react'
import Modal from 'components/UI/Modal';
import { useAppSelector } from 'state/hooks';
import { BROADCAST_MUTATION } from 'graphql/mutation/broadcast-mutation';
import { useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { CREATE_SET_PROFILE_IMAGE_URI_TYPED_DATA_MUTATION } from 'graphql/mutation/update-profile-image';
import {
  CreateSetProfileImageUriBroadcastItemResult,
  MediaSet,
  NftImage,
  Profile
} from 'generated/types'
import omit from 'utils/omit'
import splitSignature from 'utils/splitSignature'
import { useContractWrite, useSignTypedData } from 'wagmi'
import { LENSHUB_PROXY } from 'constants/constants';
import { LensHubProxy } from 'abis/LensHubProxy';
import { Spinner } from 'components/UI/Spinner';


type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  avatar: string;
  setPhotoPreviewUrl: (photoPreviewUrl: string) => void;
}

const UpdateProfileImageDialog = ({ open, setOpen, avatar, setPhotoPreviewUrl }: Props) => {

  const currentUser = useAppSelector(state => state.user.currentUser)
  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
    onError(error) {
      toast.error("User rejected denied message signature")
    }
  })
  const onCompleted = () => {
    toast.success('Profile Image updated successfully!')
    setOpen(false)
  }

  const {
    data: writeData,
    isLoading: writeLoading,
    error,
    write
  } = useContractWrite({
    addressOrName: LENSHUB_PROXY,
    contractInterface: LensHubProxy,
    functionName: 'setProfileImageURIWithSig',
    mode: 'recklesslyUnprepared',
    onSuccess() {
      onCompleted()
    },
    onError(error: any) {
      toast.error(error?.data?.message ?? error?.message)
    }
  })
  const [broadcast, { data: broadcastData, loading: broadcastLoading }] =
    useMutation(BROADCAST_MUTATION, {
      onCompleted: (data) => {
        console.log(data)
      },
      onError(error) {

        console.error('[Broadcast Error]', error)

      }
    })

  const [createSetProfileImageURITypedData, { loading: typedDataLoading }] =
    useMutation(CREATE_SET_PROFILE_IMAGE_URI_TYPED_DATA_MUTATION, {
      async onCompleted({
        createSetProfileImageURITypedData
      }: {
        createSetProfileImageURITypedData: CreateSetProfileImageUriBroadcastItemResult
      }) {
        console.log('[Mutation]', 'Generated createSetProfileImageURITypedData')
        const { id, typedData } = createSetProfileImageURITypedData
        const { deadline } = typedData?.value

        try {
          const signature = await signTypedDataAsync({
            domain: omit(typedData?.domain, '__typename'),
            types: omit(typedData?.types, '__typename'),
            value: omit(typedData?.value, '__typename')
          })

          const { profileId, imageURI } = typedData?.value
          const { v, r, s } = splitSignature(signature)
          const sig = { v, r, s, deadline }
          const inputStruct = {
            profileId,
            imageURI,
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
      onError(error) {
        toast.error(error.message)
      }
    })


  const handleConfirm = () => {
    if (!currentUser) return toast.error("Please login first")

    createSetProfileImageURITypedData({
      variables: {
        request: {
          profileId: currentUser?.id,
          url: avatar
        }
      }
    })
  }
  return (
    <Modal open={open} onClose={() => {
      setOpen(false)
      setPhotoPreviewUrl(currentUser?.picture?.original?.url)
    }} size='xs' position='middle' >
      <div className='flex flex-col gap-4 p-2'>
        <div className='text-[20px] font-bold'>Update Profile Image?</div>
        <div className='text-gray-400'>By click yes, you will sign a transaction to update your profile image.</div>
        <button onClick={handleConfirm}
          className='flex justify-center items-center p-2 bg-[#eff3f4] text-black rounded-lg hover:bg-opacity-80 disabled:bg-opacity-80'>
          {(typedDataLoading || signLoading || writeLoading || broadcastLoading) && <Spinner className='mr-2 border-t-black border-[#eff3f4]' size='xs' />}
          <div>Yes </div>
        </button>
        <button onClick={() => {
          setOpen(false)
          setPhotoPreviewUrl(currentUser?.picture?.original?.url)
        }} className='p-2 rounded-lg hover:border hover:border-red-600 hover:text-red-600'>No</button>
      </div>
    </Modal>
  )
}

export default UpdateProfileImageDialog