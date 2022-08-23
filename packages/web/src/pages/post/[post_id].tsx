import { useMutation, useQuery } from '@apollo/client'
import { LensHubProxy } from 'abis/LensHubProxy'
import Collect from 'components/Actions/Collect'
import Comment from 'components/Actions/Comment'
import Like from 'components/Actions/Like'
import Mirror from 'components/Actions/Mirror'
import CommentFeeds from 'components/Comment/CommentFeeds'
import NewsFeed from 'components/Home/NewsFeed'
import Search from 'components/Home/Search'
import Button from 'components/UI/Button'
import { Spinner } from 'components/UI/Spinner'
import { APP_NAME, LENSHUB_PROXY } from 'constants/constants'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { CreateCommentBroadcastItemResult, EnabledModule, Publication } from 'generated/types'
import { BROADCAST_MUTATION } from 'graphql/mutation/broadcast-mutation'
import { CREATE_COMMENT_TYPED_DATA_MUTATION } from 'graphql/mutation/create-comment'
import { PUBLICATION_QUERY } from 'graphql/query/publication-query'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { BiArrowBack } from 'react-icons/bi'
import { useAppSelector } from 'state/hooks'
import { PublicationMainFocus, PublicationMetadata } from 'types/publication-metadata'
import getIPFSLink from 'utils/getIPFSLink'
import { Mixpanel } from 'utils/Mixpanel'
import omit from 'utils/omit'
import splitSignature from 'utils/splitSignature'
import { uploadIpfs } from 'utils/uploadToIPFS'
import { v4 as uuid } from 'uuid'
import { useContractWrite, useSignTypedData } from 'wagmi'


dayjs.extend(relativeTime)

type Props = {}

const Post: NextPage = (props: Props) => {
    const router = useRouter()
    const { post_id } = router.query
    const [publication, setPublication] = useState<Publication>()
    const [commentInput, setCommentInput] = useState("")
    const currentUser = useAppSelector(state => state.user.currentUser)
    const { data, loading, error } = useQuery(PUBLICATION_QUERY, {
        variables: {
            request: { publicationId: post_id },
            reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
            profileId: currentUser?.id ?? null
        },
        skip: !post_id,
        onCompleted: (data) => {
            setPublication(data?.publication)
            console.log('[Query]', `Fetched publication details Publication:${data}`)
        },
        onError: (error) => {
            console.error('[Query Error]', error)
        }
    })
    useEffect(() => {
        if (data) {
            setPublication(data?.publication)
        }
    }, [data])

    const [selectedModule, setSelectedModule] =
        useState<EnabledModule>()
    const [onlyFollowers, setOnlyFollowers] = useState<boolean>(false)
    const [isUploading, setIsUploading] = useState<boolean>(false)
    const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
        onError(error) {
            toast.error("User rejected denied message signature")
        }
    })
    const { data: contractWriteData,
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

                setCommentInput("")
                toast.success('Successfully sent transaction: ' + hash)
                Mixpanel.track("publication.comment", { result: 'success' })
                toast.promise(
                    wait(),
                    {
                        loading: 'Comment creating...',
                        success: (data) => {
                            if (data.status) {
                                return `Comment created successfully`
                            } else {
                                return `Comment creation failed`
                            }
                        },
                        error: (err) => `This just happened: ${err.toString()}`,
                    }

                )

            },
            onError: (error) => {
                toast.error(error?.message)
                Mixpanel.track("publication.comment", { result: 'error' })

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

                if ('reason' in result)
                    write?.({ recklesslySetUnpreparedArgs: inputStruct })

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
                toast.success('Comment created successfully')
                Mixpanel.track("publication.comment", { result: 'succcess' })

                setCommentInput("")
            },
            onError(error) {
                // if (error.message === ERRORS.notMined) {
                //   toast.error(error.message)
                // }
                console.error('[Broadcast Error]', error)
                Mixpanel.track("publication.comment", { result: 'broadcast_error' })
            }
        })
    const createComment = async () => {
        if (!commentInput) return
        setIsUploading(true)
        const publicationMetaData: PublicationMetadata = {
            version: '1.0.0',
            metadata_id: uuid(),
            description: commentInput,//TODO: add trimify (figure out why)
            content: commentInput,
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
                    publicationId: post_id,
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
    const handleCreateComment = () => {

    }
    if (!publication || loading) return (
        <div className='flex w-full justify-center'>
            <Spinner size='lg' />
        </div>
    )

    return (
        <div className='grid grid-cols-3 w-full'>
            <div className='col-span-2 flex flex-col px-4 h-full overflow-auto no-scrollbar border-r border-border-gray'>
                <div className='flex gap-4 w-full items-center pb-4'>
                    <div onClick={() => router.back()} className='w-8 h-8 rounded-full flex justify-center items-center text-[20px] hover:bg-primary-blue hover:bg-opacity-30 hover:text-sky-400'>
                        <BiArrowBack />
                    </div>
                    <div className='text-[20px] font-bold'>
                        Post
                    </div>
                </div>
                <div className='flex justify-between items-center'>


                    <div className='flex gap-2'>
                        <img
                            //@ts-ignore
                            src={getIPFSLink(publication?.profile?.picture?.original?.url)} className='w-12 h-12 rounded-full' />
                        <div className='flex flex-col text-[15px]'>
                            <div className='font-bold'>{publication?.profile?.name}</div>
                            <div className='text-gray-400'>@{publication?.profile?.handle}</div>
                        </div>
                    </div>
                    <div className='text-[13px] text-gray-400'>
                        {publication && dayjs(new Date(publication?.createdAt)).fromNow()}
                    </div>

                </div>
                <div className='text-[20px] py-4'>
                    {publication && publication?.metadata?.content}
                </div>
                <div className='flex justify-around py-4 border-b border-border-gray text-gray-400'>
                    <Comment post={publication} />
                    <Like post={publication} />
                    <Mirror post={publication} />
                    <Collect post={publication} />
                </div>
                {currentUser && <div className='flex justify-between items-center py-4 border-b border-border-gray'>
                    <div className='flex items-start gap-2'>
                        <img src={getIPFSLink(currentUser?.picture?.original?.url)} className='w-12 h-12 rounded-full' />
                        <div contentEditable defaultValue={commentInput} className='text-[20px] outline-none py-3' placeholder='Write your reply' onInput={(e) => setCommentInput(e?.currentTarget?.innerText)} />
                    </div>
                    <div>
                        <Button
                            disabled={
                                !commentInput
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
                                && <Spinner size='sm' />}
                            onClick={createComment}>
                            {isUploading || writeLoading || signLoading ?
                                (writeLoading ?
                                    "Confirming" :
                                    (signLoading ?
                                        "Signing" :
                                        "Uploading")) :
                                "Reply"
                            }
                        </Button>
                    </div>
                </div>}

                <CommentFeeds publicationId={publication?.id} />

            </div>
            <div className='col-span-1 p-4 gap-2'>
                <Search />
                <NewsFeed height='100vh' />
            </div>


        </div >
    )
}


export default Post