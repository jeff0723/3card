import { FollowNFT } from 'abis/FollowNFT'
import { useMutation } from '@apollo/client'
import omit from 'utils/omit'
import splitSignature from 'utils/splitSignature'
import { LensHubProxy } from 'abis/LensHubProxy'
import { LENSHUB_PROXY } from 'constants/constants'
import { CreateUnfollowBroadcastItemResult, Profile } from 'generated/types'
import { BROADCAST_MUTATION } from 'graphql/mutation/broadcast-mutation'
import { CREATE_UNFOLLOW_TYPED_DATA_MUTATION } from 'graphql/mutation/create-follow-type-data-mutation'
import toast from 'react-hot-toast'
import { useAppSelector } from 'state/hooks'
import { useAccount, useContractWrite, useSigner, useSignTypedData } from 'wagmi'
import { Dispatch, useState } from 'react'
import { Spinner } from 'components/UI/Spinner'
import { Contract, Signer } from 'ethers'

type Props = {
    profile: Profile
    setFollowed: Dispatch<boolean>
    setFollowerCount: Dispatch<number>
    followerCount: number
}

const UnfollowButton = ({ profile, setFollowed, setFollowerCount, followerCount }: Props) => {
    const { address } = useAccount()
    const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)
    const currentUser = useAppSelector(state => state.user.currentUser)
    const { data: signer } = useSigner()
    const [writeLoading, setWriteLoading] = useState(false)
    const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
        onError(error) {
            toast.error("User rejected denied message signature")
        }
    })
    const [createUnfollowTypedData, { loading: typedDataLoading }] = useMutation(
        CREATE_UNFOLLOW_TYPED_DATA_MUTATION,
        {
            async onCompleted({
                createUnfollowTypedData
            }: {
                createUnfollowTypedData: CreateUnfollowBroadcastItemResult
            }) {
                const { typedData } = createUnfollowTypedData
                const { deadline } = typedData?.value

                try {
                    const signature = await signTypedDataAsync({
                        domain: omit(typedData?.domain, '__typename'),
                        types: omit(typedData?.types, '__typename'),
                        value: omit(typedData?.value, '__typename')
                    })
                    const { tokenId } = typedData?.value
                    const { v, r, s } = splitSignature(signature)
                    const sig = { v, r, s, deadline }
                    setWriteLoading(true)
                    try {
                        const followNftContract = new Contract(
                            typedData.domain.verifyingContract,
                            FollowNFT,
                            signer as Signer
                        )

                        const tx = await followNftContract.burnWithSig(tokenId, sig)
                        if (tx) {
                            if (followerCount && setFollowerCount) {
                                setFollowerCount(followerCount - 1)
                                toast.success(`Successfully sent transation: ${tx.hash}`)
                            }
                            setFollowed(false)
                        }
                        await tx.wait()
                        toast.success('Unfollowed successfully!')
                    } catch {
                        toast.error('User rejected request')
                    } finally {
                        setWriteLoading(false)
                    }
                } catch (error) {
                    console.warn('[Sign Error]', error)
                }
            },
            onError(error) {
                toast.error(error.message)
            }
        }
    )

    const createUnfollow = () => {
        if (!isAuthenticated) return toast.error("Please connect your wallet")

        createUnfollowTypedData({
            variables: {
                request: { profile: profile?.id }
            }
        })
    }

    return (
        <button
            className='flex justify-center items-center rounded-full px-4 py-2 text-white border border-[#536471] font-semibold h-10 hover:bg-opacity-80 disabled:bg-opacity-80'
            onClick={createUnfollow}
            disabled={
                typedDataLoading || signLoading || writeLoading
            }>
            {(typedDataLoading || signLoading || writeLoading) && <Spinner className='mr-2 border-t-[#eff3f4] border-black' size='xs' />}
            Unfollow
        </button>
    )
}

export default UnfollowButton