import { useMutation } from '@apollo/client'
import { LensHubProxy } from 'abis/LensHubProxy'
import Button from 'components/UI/Button'
import { Spinner } from 'components/UI/Spinner'
import { LENSHUB_PROXY } from 'constants/constants'
import { Publication, CreateCollectBroadcastItemResult } from 'generated/types'
import { BROADCAST_MUTATION } from 'graphql/mutation/broadcast-mutation'
import { CREATE_COLLECT_TYPED_DATA_MUTATION } from 'graphql/mutation/create-collect-mutation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAppSelector } from 'state/hooks'
import omit from 'utils/omit'
import splitSignature from 'utils/splitSignature'
import { useAccount, useContractWrite, useSignTypedData } from 'wagmi'
import { Mixpanel } from 'utils/Mixpanel';

type Props = {
    community: Publication
}

const Join = ({ community }: Props) => {
    const [joined, setJoined] = useState<boolean>()
    const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)
    const { address } = useAccount()
    const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
        onError(error) {
            toast.error("User denied message signature")
        }
    })

    useEffect(() => {
        if (community) {
            setJoined(community?.hasCollectedByMe)
        }
    }, [community])
    const { isLoading: writeLoading, write } = useContractWrite({
        addressOrName: LENSHUB_PROXY,
        contractInterface: LensHubProxy,
        functionName: 'collectWithSig',
        mode: 'recklesslyUnprepared',
        onSuccess: (data) => {
            const { wait, hash } = data

            toast.success('Successfully sent transaction: ' + hash)
            Mixpanel.track("publication.join_community", { result: 'success' })

            toast.promise(
                wait(),
                {
                    loading: 'Joining community...',
                    success: (data) => {
                        if (data.status) {
                            setJoined(true)
                            return `Successfully joined community`
                        } else {
                            return `Join community failed`
                        }
                    },
                    error: (err) => `This just happened: ${err.toString()}`,
                }

            )
        },
        onError(error: any) {
            toast.error(error?.data?.message ?? error?.message)
            Mixpanel.track("publication.join_community", { result: 'error' })

        }
    })

    const [broadcast, { loading: broadcastLoading }] = useMutation(
        BROADCAST_MUTATION,
        {
            onCompleted: (data) => {
                console.log('broadcast completed', data)
                Mixpanel.track("publication.join_community", { result: 'success' })
                setJoined(true)
                toast.success('Successfully joined community')

            },
            onError(error) {
                console.error('[Broadcast Error]', error)
                Mixpanel.track("publication.join_community", { result: 'broadcast_error' })

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
                toast.error(error?.message)
            }
        }
    )

    const createCollect = () => {
        if (!isAuthenticated) return toast.error("Please login to lens first")

        createCollectTypedData({
            variables: {
                request: { publicationId: community.id }
            }
        })
    }
    console.log(joined)
    return (
        <Button
            onClick={createCollect}
            icon={(signLoading || writeLoading || typedDataLoading || broadcastLoading) && <Spinner size='xs' />}
            disabled={signLoading || writeLoading || typedDataLoading || broadcastLoading || joined}>

            {joined ? 'Joined' : 'Join'}
        </Button>
    )
}

export default Join