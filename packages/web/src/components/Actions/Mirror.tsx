import { Publication } from 'generated/types';
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import styled from 'styled-components';
import { useAppSelector } from 'state/hooks';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useContractWrite, useSignTypedData } from 'wagmi'
import omit from 'utils/omit'
import splitSignature from 'utils/splitSignature'
import { BROADCAST_MUTATION } from 'graphql/mutation/broadcast-mutation';
import { CREATE_MIRROR_TYPED_DATA_MUTATION } from 'graphql/mutation/create-mirror-type-data-mutation';
import { LENSHUB_PROXY } from 'constants/constants';
import { LensHubProxy } from 'abis/LensHubProxy';
import { useMutation } from '@apollo/client';
import { CreateMirrorBroadcastItemResult } from 'generated/types'
type Props = {
    post: Publication
}
const Container = styled.div<{ mirrored: boolean }>`
    color: ${({ mirrored }) => mirrored ? "rgba(0,186,124)" : '#fffff'};
    &:hover {
        color: rgba(0,186,124);
    }
`
const HoverBox = styled.div`
    &:hover {
        background: rgba(0,186,124,0.1);
    }
`
const Mirror = ({ post }: Props) => {
    const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)
    const currentUser = useAppSelector(state => state.user.currentUser)
    const [count, setCount] = useState<number>(post.__typename === 'Mirror'
        ? post?.mirrorOf?.stats?.totalAmountOfMirrors
        : post?.stats?.totalAmountOfMirrors)
    const [mirrored, setMirrored] = useState<boolean>(
        post?.mirrors?.length > 0
    )

    const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
        onError(error) {
            toast.error(error?.message)
        }
    })

    const onCompleted = () => {
        setCount(count + 1)
        setMirrored(true)
        toast.success('Post has been mirrored!')
    }

    const { isLoading: writeLoading, write } = useContractWrite({
        addressOrName: LENSHUB_PROXY,
        contractInterface: LensHubProxy,
        functionName: 'mirrorWithSig',
        mode: 'recklesslyUnprepared',
        onSuccess() {
            onCompleted()
        },
        onError(error: any) {
            toast.error(error?.data?.message ?? error?.message)
        }
    })

    const [broadcast, { loading: broadcastLoading }] = useMutation(
        BROADCAST_MUTATION,
        {
            onCompleted: (data) => {
                console.log(data)
            },
            onError(error) {

                console.error('[Broadcast Error]', error)
            }
        }
    )
    const [createMirrorTypedData, { loading: typedDataLoading }] = useMutation(
        CREATE_MIRROR_TYPED_DATA_MUTATION,
        {
            async onCompleted({
                createMirrorTypedData
            }: {
                createMirrorTypedData: CreateMirrorBroadcastItemResult
            }) {

                const { id, typedData } = createMirrorTypedData
                const {
                    profileId,
                    profileIdPointed,
                    pubIdPointed,
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
            onError(error) {
                toast.error(error.message)
            }
        }
    )

    const createMirror = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (!isAuthenticated) return toast.error("Please login first!")
        createMirrorTypedData({
            variables: {
                request: {
                    profileId: currentUser?.id,
                    publicationId: post?.id,
                    referenceModule: {
                        followerOnlyReferenceModule: false
                    }
                }
            }
        })
    }
    return (
        <Container mirrored={mirrored} className='flex gap-2 items-center' onClick={createMirror}>
            <HoverBox className='flex justify-center items-center w-8 h-8 rounded-full'>
                <HiOutlineSwitchHorizontal className='text-[20px]' />
            </HoverBox>
            <div className='text-[13px]'>{count}</div>

        </Container>
    )
}

export default Mirror