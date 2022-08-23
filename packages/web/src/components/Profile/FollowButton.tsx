import { useMutation } from '@apollo/client'
import omit from 'utils/omit'
import splitSignature from 'utils/splitSignature'
import { LensHubProxy } from 'abis/LensHubProxy'
import { LENSHUB_PROXY } from 'constants/constants'
import { CreateFollowBroadcastItemResult, Profile } from 'generated/types'
import { BROADCAST_MUTATION } from 'graphql/mutation/broadcast-mutation'
import { CREATE_FOLLOW_TYPED_DATA_MUTATION } from 'graphql/mutation/create-follow-type-data-mutation'
import toast from 'react-hot-toast'
import { useAppSelector } from 'state/hooks'
import { useAccount, useContractWrite, useSignTypedData } from 'wagmi'
import { Dispatch } from 'react'
import { Spinner } from 'components/UI/Spinner'

type Props = {
    profile: Profile
    setFollowed: Dispatch<boolean>
    setFollowerCount: Dispatch<number>
    followerCount: number
}

const FollowButton = ({ profile, setFollowed, setFollowerCount, followerCount }: Props) => {
    const { address } = useAccount()
    const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)
    const currentUser = useAppSelector(state => state.user.currentUser)
    const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
        onError(error) {
            toast.error("User rejected denied message signature")
        }
    })
    const { isLoading: writeLoading, write } = useContractWrite({
        addressOrName: LENSHUB_PROXY,
        contractInterface: LensHubProxy,
        functionName: 'followWithSig',
        mode: 'recklesslyUnprepared',
        onSuccess(data) {
            const { wait, hash } = data
            setFollowed(true)
            setFollowerCount(followerCount + 1)
            toast.success('Successfully sent transaction: ' + hash)
            toast.promise(
                wait(),
                {
                    loading: 'Following...',
                    success: (data) => {
                        if (data.status) {
                            return `Successfully followed @${profile.handle}`
                        } else {
                            return `Follow failed`
                        }
                    },
                    error: (err) => `This just happened: ${err.toString()}`,
                }

            )
        },
        onError(error: any) {
            toast.error(error?.data?.message ?? error?.message)
        }
    })
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
    const [createFollowTypedData, { loading: typedDataLoading }] = useMutation(
        CREATE_FOLLOW_TYPED_DATA_MUTATION,
        {
            async onCompleted({
                createFollowTypedData
            }: {
                createFollowTypedData: CreateFollowBroadcastItemResult
            }) {
                const { id, typedData } = createFollowTypedData
                const { deadline } = typedData?.value

                try {
                    const signature = await signTypedDataAsync({
                        domain: omit(typedData?.domain, '__typename'),
                        types: omit(typedData?.types, '__typename'),
                        value: omit(typedData?.value, '__typename')
                    })
                    const { profileIds, datas: followData } = typedData?.value
                    const { v, r, s } = splitSignature(signature)
                    const sig = { v, r, s, deadline }
                    const inputStruct = {
                        follower: address,
                        profileIds,
                        datas: followData,
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

    const createFollow = () => {
        if (!isAuthenticated) return toast.error("Please connect your wallet")

        createFollowTypedData({
            variables: {
                request: {
                    follow: {
                        profile: profile?.id,
                        followModule:
                            profile?.followModule?.__typename ===
                                'ProfileFollowModuleSettings'
                                ? { profileFollowModule: { profileId: currentUser?.id } }
                                : null
                    }
                }
            }
        })
    }

    return (
        <button
            className='flex justify-center items-center rounded-full px-4 py-2 text-black bg-[#eff3f4] font-semibold h-10 hover:bg-opacity-80 disabled:bg-opacity-80'
            onClick={createFollow}
            disabled={
                typedDataLoading || signLoading || writeLoading || broadcastLoading
            }>
            {(typedDataLoading || signLoading || writeLoading || broadcastLoading) && <Spinner className='mr-2 border-t-black border-[#eff3f4]' size='xs' />}
            Follow
        </button>
    )
}

export default FollowButton