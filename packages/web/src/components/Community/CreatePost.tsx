import { useMutation } from '@apollo/client';
import { LensHubProxy } from 'abis/LensHubProxy';
import { Spinner } from 'components/UI/Spinner';
import { APP_NAME, LENSHUB_PROXY } from 'constants/constants';
import { CreateCommentBroadcastItemResult, CreatePostBroadcastItemResult } from 'generated/types';
import { BROADCAST_MUTATION } from 'graphql/mutation/broadcast-mutation';
import { CREATE_COMMENT_TYPED_DATA_MUTATION } from 'graphql/mutation/create-comment';
import { CREATE_POST_TYPED_DATA_MUTATION } from 'graphql/mutation/create-post';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiImage2Line } from 'react-icons/ri';
import { useAppSelector } from 'state/hooks';
import { PublicationMainFocus, PublicationMetadata } from 'types/publication-metadata';
import omit from 'utils/omit';
import splitSignature from 'utils/splitSignature';
import { uploadIpfs } from 'utils/uploadToIPFS';
import { v4 as uuid } from 'uuid';
import { useContractWrite, useSignTypedData } from 'wagmi';


type Props = {
    communityId: string
}

const CreatePost = ({ communityId }: Props) => {

    const currentUser = useAppSelector(state => state.user.currentUser)
    const [isLoading, setIsUploading] = useState<boolean>(false)
    const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
        onError(error) {
            toast.error(error?.message)
        }
    })
    const [postInput, setPostInput] = useState("")
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
                console.log("broadcast result:", result)
                if ('reason' in result) write?.({ recklesslySetUnpreparedArgs: inputStruct })


            } catch (error) {
                console.warn('[Sign Error]', error)
            }

        },
        onError: (error) => {
            console.log(error)

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
                    publicationId: communityId,
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
        <div className='flex gap-2 items-center p-2 border border-border-gray'>
            <img src={currentUser?.picture?.original?.url} className='w-10 h-10 rounded-full' />
            <div contentEditable placeholder='Create a post...' className='w-full p-4 outline-none' onInput={(e) => setPostInput(e?.currentTarget?.innerText)} />
            <div className='flex items-center gap-2'>
                <RiImage2Line className='text-[20px] text-primary-blue' />

                <button
                    onClick={createPost}
                    disabled={isLoading || typedDataLoading || signLoading || writeLoading || broadcastLoading}
                    className='flex gap-2 text-primary-blue font-bold p-2 rounded-lg hover:text-sky-400 hover:bg-primary-blue hover:bg-opacity-30 disabled:bg-none'>
                    {(isLoading || typedDataLoading || signLoading || writeLoading || broadcastLoading) && <Spinner size='sm' />}
                    POST
                </button>
            </div>
        </div>
    )
}

export default CreatePost