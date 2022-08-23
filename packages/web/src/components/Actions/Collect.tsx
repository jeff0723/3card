import { Publication } from 'generated/types';
import React from 'react'
import { HiBookmark, HiOutlineBookmark } from "react-icons/hi";
import { useAppSelector } from 'state/hooks';
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import styled from 'styled-components';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, useContractWrite, useSignTypedData } from 'wagmi'
import omit from 'utils/omit'
import splitSignature from 'utils/splitSignature'
import { BROADCAST_MUTATION } from 'graphql/mutation/broadcast-mutation';
import { CREATE_MIRROR_TYPED_DATA_MUTATION } from 'graphql/mutation/create-mirror-type-data-mutation';
import { LENSHUB_PROXY } from 'constants/constants';
import { LensHubProxy } from 'abis/LensHubProxy';
import { useMutation } from '@apollo/client';
import { CreateCollectBroadcastItemResult } from 'generated/types'
import { CREATE_COLLECT_TYPED_DATA_MUTATION } from 'graphql/mutation/create-collect-mutation';
type Props = {
    post: Publication
}
const Container = styled.div<{ collected: boolean }>`
    color: ${({ collected }) => collected ? "rgba(0,148,255)" : '#fffff'};
    &:hover {
        color: rgba(0,148,255);
    }
`

const Collect = ({ post }: Props) => {
    const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)
    const currentUser = useAppSelector(state => state.user.currentUser)
    const { address } = useAccount()
    const [collected, setCollected] = useState<boolean>(
        isAuthenticated ? post?.hasCollectedByMe : false)
    const [count, setCount] = useState<number>(post?.stats?.totalAmountOfCollects)

    const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
        onError(error) {
            toast.error("User rejected denied message signature")
        }
    })
    const onCompleted = () => {
        setCount(count + 1)
        setCollected(true)
        toast.success('Post has been collected!')
    }
    const { isLoading: writeLoading, write } = useContractWrite({
        addressOrName: LENSHUB_PROXY,
        contractInterface: LensHubProxy,
        functionName: 'collectWithSig',
        mode: 'recklesslyUnprepared',
        onSuccess() {
            onCompleted()
        },
        onError(error) {
            toast.error(error.message)
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
    const [createCollectTypedData, { loading: typedDataLoading }] = useMutation(
        CREATE_COLLECT_TYPED_DATA_MUTATION,
        {
            async onCompleted({
                createCollectTypedData
            }: {
                createCollectTypedData: CreateCollectBroadcastItemResult
            }) {
                console.log('[Mutation]', 'Generated createCollectTypedData')
                const { id, typedData } = createCollectTypedData
                const { deadline } = typedData?.value

                try {
                    const signature = await signTypedDataAsync({
                        domain: omit(typedData?.domain, '__typename'),
                        types: omit(typedData?.types, '__typename'),
                        value: omit(typedData?.value, '__typename')
                    })


                    const { profileId, pubId, data: collectData } = typedData?.value
                    const { v, r, s } = splitSignature(signature)
                    const sig = { v, r, s, deadline }
                    const inputStruct = {
                        collector: address,
                        profileId,
                        pubId,
                        data: collectData,
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
    const createCollect = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (!isAuthenticated) return toast.error("Please login to lens first")

        createCollectTypedData({
            variables: {
                request: { publicationId: post?.id }
            }
        })
    }
    return (
        <Container collected={collected} className='flex gap-2 text-white hover:text-sky-400 items-center' onClick={createCollect}>
            <div className='flex justify-center items-center w-8 h-8 rounded-full  hover:bg-primary-blue hover:bg-opacity-20 '>
                {
                    collected ? <HiBookmark className='text-[20px]' /> : <HiOutlineBookmark className='text-[20px]' />
                }
            </div>
            <div className='text-[13px]'>{count}</div>

        </Container>
    )
}

export default Collect