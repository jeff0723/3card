import React, { useContext, useEffect, useState } from 'react'
import PostBody from 'components/Profile/PostBody'
import PostHeader from 'components/Profile/PostHeader'
import { MediaSet, NftImage, Profile, Publication } from 'generated/types'
import Link from 'next/link'
import { useRouter } from 'next/router'
import MirrorText from './MirrorText'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Button from 'components/UI/Button'
import getIPFSLink from 'utils/getIPFSLink'
import { OrderWithCounter, ConsiderationItem, Order } from '@opensea/seaport-js/lib/types';
import { ItemType } from '@opensea/seaport-js/lib/constants';

import { auth } from 'utils/uploadToIPFS'
import ConsiderationCard from 'components/Home/ConsiderationCard'
import { Spinner } from 'components/UI/Spinner'
import SeaportContext from 'contexts/seaport'
import { useAppSelector } from 'state/hooks'
import toast from 'react-hot-toast'
import omit from 'utils/omit'
import { HiCheck } from 'react-icons/hi'
import { OPENSEA_URL } from 'constants/constants'

dayjs.extend(relativeTime)
type Props = {
    post: Publication
}
type Offer = {
    itemType: ItemType;
    token: string;
    identifier: string;
    name: string;
    contentUri: string;
}
const NFTPost = ({ post }: Props) => {
    const router = useRouter()
    const currentUser = useAppSelector(state => state.user.currentUser)
    const { seaport } = useContext(SeaportContext)
    const [offer, setOffer] = useState<Offer[]>()
    const [consierations, setConsierations] = useState<ConsiderationItem[]>()
    const [order, setOrder] = useState<OrderWithCounter>()
    const [loading, setLoading] = useState(false)
    const [fulfillLoading, setFulfillLoading] = useState(false)
    const [fulfilled, setFulfilled] = useState(false)
    const fetchInfo = async () => {
        if (post?.metadata?.attributes[1]?.value) {
            const url = getIPFSLink(post?.metadata?.attributes[1]?.value).replace('https://ipfs.infura.io', 'https://ipfs.io')
            setLoading(true)
            const data = await fetch(url)
            const { order, offer, considerations } = await data.json().finally(() => setLoading(false))
            setOrder(order)
            setOffer(offer)
            setConsierations(considerations)

        }
    }
    const fetchStatus = async () => {
        if (seaport && order) {
            // const _order = omit(order, 'counter') as Order
            try {
                const { callStatic } = await seaport.validate([order as Order])
                const status = await callStatic()
                setFulfilled(!status)
            } catch {
                setFulfilled(true)
            }

        }
    }
    useEffect(() => {

        fetchInfo()
    }, [post])
    useEffect(() => {
        fetchStatus()
    }, [order])
    const fullfillOrder = async () => {
        if (!currentUser) {
            toast.error("Please login first!")
            return
        }
        if (order && seaport) {
            try {
                setFulfillLoading(true)

                const { executeAllActions: executeAllFulfillActions } =
                    await seaport?.fulfillOrder({
                        order,
                        accountAddress: currentUser?.ownedBy,
                    });

                const tx = await executeAllFulfillActions().finally(() => {
                    toast.success('Successfully sent transaction: ' + tx.hash)
                    setFulfillLoading(false)
                });
                toast.promise(
                    tx.wait(),
                    {
                        loading: 'Order fulfilling...',
                        success: (data) => {
                            if (data.status) {
                                return `Fulfill order successfully`
                            } else {
                                return `Fulfill order  failed`
                            }
                        },
                        error: (err) => `This just happened: ${err.toString()}`,
                    }

                )

            } catch (error) {
                //@ts-ignore
                toast.error(error.message)
            }
            finally {
                setFulfillLoading(false)
            }

        }
    }
    console.log(order)
    return (
        <div className='flex flex-col border-b border-border-gray py-4'>

            <div className='flex gap-[10px] w-full'>
                <PostHeader profile={post?.profile as Profile & { picture: MediaSet & NftImage }} />
                <div className='flex flex-col w-full'>
                    <div className='flex justify-between text-[15px]  w-full '>
                        <div className='flex'>
                            <div>{post?.profile?.name}</div>
                            <div className='text-gray-400'>@{post?.profile?.handle} · {dayjs(new Date(post?.createdAt)).fromNow()}</div>
                        </div>
                        <div>
                            {order && !fulfilled &&
                                <Button onClick={fullfillOrder}
                                    disabled={!order || !seaport || fulfillLoading}
                                    icon={
                                        fulfillLoading && <Spinner size='xs' />
                                    }>Fulfill
                                </Button>
                            }
                            {fulfilled && <div className='flex gap-2 items-center rounded-2xl bg-white bg-opacity-10 py-2 px-3'>
                                <HiCheck className='text-green-400 text-[20px]' />
                                <div>Fulfilled</div></div>}
                        </div>
                    </div>
                    <div>
                        {post?.metadata?.content}
                    </div>
                    {
                        loading && <div className='flex justify-center items-center'>
                            <Spinner size='md' />
                        </div>
                    }
                    <div className='flex flex-col mt-4'>
                        <div className='flex flex-col gap-2' >
                            <div className='text-[15px] font-bold'>Offer</div>
                            {offer?.map((item: Offer, index) => (
                                //[FIX] to fix add chainId to item
                                <a href={`${OPENSEA_URL}/assets/mumbai/${item.token}/${item.identifier}`} target="_blank" rel="noopener noreferrer" key={`${index}-offer`} >
                                    <div className='flex gap-4 items-center p-2 rounded-lg border border-border-gray w-full hover:border-primary-blue'>
                                        <img src={getIPFSLink(item.contentUri)} alt={item.name} className='w-[100px] h-[100px] rounded-lg' />
                                        <div className='flex flex-col'>
                                            <div>Contract Address: {item.token}</div>
                                            <div>Name: {item.name}</div>
                                            <div>ID: {item.identifier}</div>
                                        </div>
                                    </div>
                                </a>

                            ))}
                        </div>
                    </div>
                    <div className='flex flex-col'>
                        <div className='flex flex-col gap-2' >
                            <div className='text-[15px] font-bold'>For</div>
                            {consierations?.map((consideration: ConsiderationItem, index) => (

                                <ConsiderationCard consideration={consideration} key={index} />
                            ))}
                        </div>
                    </div>

                </div>
            </div>


        </div >
    )
}

export default NFTPost