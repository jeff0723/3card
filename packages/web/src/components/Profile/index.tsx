import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { PROFILE_QUERY } from 'graphql/query/profile'
import { useQuery } from '@apollo/client'
import { useAppSelector } from 'state/hooks'
import Button from 'components/UI/Button'
import { HiOutlineUserAdd } from "react-icons/hi";
import { FiMail } from "react-icons/fi";
import ProfileTabs from './ProfileTabs'
import Content from './Content'
import { current } from '@reduxjs/toolkit'
import NFTFeed from './NFTFeed'
import Activities from './Activities'
import Ranking from './Ranking'
import getIPFSLink from 'utils/getIPFSLink'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import { Frequency, NormalTx, ScanRankingResult, ADDRESS_TAGS } from 'scan-helper'
import EditProfileModal from './EditProfileModal'
import getAttribute from 'utils/getAttribute'
import { BsTwitter } from 'react-icons/bs'
import { AiOutlineGlobal } from 'react-icons/ai'
import FollowButton from './FollowButton'
import UnfollowButton from './UnfollowButton'
import toast from 'react-hot-toast'
import { NEXT_API_KEY } from 'constants/constants'

type Props = {}
export enum TabType {
    POST = 'POST',
    COMMENT = 'COMMENT',
    MIRROR = 'MIRROR',
    NFT = 'NFT',
    ACTIVITIES = 'ACTIVITIES',
    RANKING = 'RANKING'
}

const Container = styled.div`
`
const Profile: NextPage = (props: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser)
    const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)
    const router = useRouter()
    const { username } = router.query
    const [currentTab, setCurrentTab] = useState<string>(TabType.POST)
    const { address, isConnected } = useAccount()
    const [txList, setTxList] = useState<NormalTx[]>([])
    const [ranking, setRanking] = useState<Frequency[]>([])
    const [tags, setTags] = useState<string[]>([])
    const [editModalOpen, setEditModalOpen] = useState(false)
    const { data, loading, error } = useQuery(PROFILE_QUERY, {
        variables: { request: { handle: username }, who: currentUser?.id ?? null },
        skip: !username,
        onCompleted(data) {
            console.log(
                '[Query]',
                `Fetched profile details Profile:${data?.profile?.id}`
            )
        },
        onError(error) {
            console.error('[Query Error]', error)
        }
    })
    const profile = data?.profile
    const isMe = profile?.ownedBy === currentUser?.ownedBy && isConnected
    const [followed, setFollowed] = useState<boolean>(profile?.isFollowedByMe)
    const [followerCount, setFollowerCount] = useState(profile?.stats?.totalFollowers)

    const getTxList = async () => {
        if (profile) {
            const query = await fetch(`/api/query/ranking?account=${profile?.ownedBy}&chain=ether&apikey=${NEXT_API_KEY}`)
            const res = query.ok ? query : await fetch(`/api/update/ranking?account=${profile?.ownedBy}&chain=ether&apikey=${NEXT_API_KEY}`)
            if (!res.ok) {
                setTxList([])
            }
            const txlistResult = (await res.json())
            setTxList(txlistResult.txlist ?? txlistResult)
        }
    };

    const getRanking = async () => {
        if (profile) {
            const res = await fetch(`/api/recommend/check?account=${profile?.ownedBy}&apikey=${NEXT_API_KEY}`)
            if (res.ok) {
                const rankingResult = (await res.json())
                setRanking(rankingResult.ranking ?? [])
            } else {
                setRanking([])
            }
        }
    }

    useEffect(() => {
        setFollowed(profile?.isFollowedByMe)
        setFollowerCount(profile?.stats?.totalFollowers)
    }, [profile])
    useEffect(() => {
        getTxList()
        getRanking()
    }, [profile])

    useEffect(() => {
        const tagSet = new Set<string>();

        if (!ranking) return
        for (const addressFreq of ranking) {
            const tagName = ADDRESS_TAGS.get(addressFreq.address)
            if (tagName && !tagSet.has(tagName)) tagSet.add(tagName)
            if (tagSet.size >= 5) break
        }

        setTags([...tagSet])
    }, [ranking])
    const handleSendMessage = () => {
        if (!isAuthenticated || !address) {
            toast.error("Please log in first!")
            return
        }
        const conversationId = profile?.ownedBy > address ? `${profile?.ownedBy}-${address}` : `${address}-${profile?.ownedBy}`
        router.push(`/messages/${conversationId}`)
    }

    return (
        <div className='w-full overflow-y-auto no-scrollbar'>
            <div className='h-52 sm:h-80 bg-black bg-opacity-50' style={{
                backgroundImage: `url(${getIPFSLink(profile?.coverPicture?.original?.url)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
            }} />

            <div className='grid grid-cols-3 '>
                <div className='col-span-1 flex flex-col items-center -mt-24 gap-[10px] overflow-y-scroll no-scrollbar'>
                    {
                        profile?.picture?.original?.url || profile?.picture?.uri ? (<div
                            className='ring-8 ring-black rounded-full bg-black w-48 h-48 object-cover'
                            style={{
                                backgroundImage: `url(${getIPFSLink(profile?.picture?.original?.url || profile?.picture?.uri)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        />) : <div className='ring-8 ring-black rounded-full bg-black object-center h-48 w-48 object-cover' />
                    }

                    <div className='flex flex-col justify-center items-start gap-[12px]'>
                        <div>
                            <div className='text-[20px]'>
                                {profile?.name}
                            </div>
                            <div className='text-gray-400'>
                                @{profile?.handle}
                            </div>
                        </div>
                        <div className='flex gap-[16px]'>
                            <div className='flex gap-[4px]'>
                                <div className='font-semibold'>
                                    {profile?.stats.totalFollowing}
                                </div>
                                <div className='text-gray-400'>
                                    Following
                                </div>
                            </div>
                            <div className='flex gap-[4px]'>
                                <div className='font-semibold'>
                                    {followerCount}
                                </div>
                                <div className='text-gray-400'>
                                    Followers
                                </div>
                            </div>
                        </div>
                        {(isMe && currentUser) ?
                            <div className='flex justify-start items-center'>
                                <EditProfileModal open={editModalOpen} setOpen={setEditModalOpen} />
                                <button
                                    className='px-4 py-2 rounded-full font-bold border border-[#536471] hover:bg-white hover:bg-opacity-10'
                                    onClick={() => { setEditModalOpen(true) }}
                                >
                                    Edit Profile
                                </button>
                            </div> :
                            <div className='flex gap-[10px] items-center justify-start'>
                                {
                                    (followed && currentUser) ? <UnfollowButton profile={profile} setFollowed={setFollowed} setFollowerCount={setFollowerCount} followerCount={followerCount}></UnfollowButton> : <FollowButton profile={profile} setFollowed={setFollowed} setFollowerCount={setFollowerCount} followerCount={followerCount} />
                                }

                                <button
                                    className='flex justify-center items-center rounded-full border border-[#536471] w-10 h-10'
                                    onClick={handleSendMessage}
                                >
                                    <FiMail className='text-[20px]' />
                                </button>

                            </div>}

                        <div className='w-[200px] border-b border-[#536471] pb-[16px]'>
                            {profile?.bio}
                        </div>
                        <div className='w-[200px] flex flex-wrap gap-[10px] border-b border-[#536471] pb-[16px]'>
                            {tags.map((item, index) => (
                                <div key={index} className='px-2 py-1 bg-primary-blue bg-opacity-30 rounded-lg'>
                                    {item}
                                </div>
                            ))}
                            {tags.length === 0 && "No tags"}
                        </div>
                        <div className='flex flex-col items-start'>
                            <div># {profile?.id}</div>
                            <div className='flex gap-2 items-center'>
                                <div>
                                    <img src='/ens.png' className='w-4 h-4' />
                                </div>
                                {profile?.onChainIdentity?.ens?.name && <div>{profile?.onChainIdentity?.ens?.name}</div>}
                            </div>

                            {
                                profile?.attributes &&
                                getAttribute(profile?.attributes, 'twitter') &&
                                <a href={`https://twitter.com/${getAttribute(profile?.attributes, 'twitter')}`} target='_blank' rel='noopener noreferrer'>
                                    <div className='flex gap-2 items-center'>
                                        <div><BsTwitter className='text-primary-blue' /></div>
                                        <div>@{getAttribute(profile?.attributes, 'twitter')}</div>
                                    </div>
                                </a>
                            }
                            {
                                profile?.attributes &&
                                getAttribute(profile?.attributes, 'website') &&
                                <a href={`${getAttribute(profile?.attributes, 'website')}`} target='_blank' rel='noopener noreferrer'>
                                    <div className='flex gap-2 items-center'>
                                        <div><AiOutlineGlobal /></div>
                                        <div>{getAttribute(profile?.attributes, 'website')}</div>
                                    </div>
                                </a>
                            }

                        </div>
                    </div>
                </div>
                <div className='col-span-2 flex flex-col h-screen'>
                    <ProfileTabs setCurrentTab={setCurrentTab} currentTab={currentTab} />
                    <div id='scrollableDiv' className='px-4 py-2 flex flex-col gap-2 overflow-y-scroll no-scrollbar'>
                        {(currentTab === TabType.POST ||
                            currentTab === TabType.COMMENT ||
                            currentTab === TabType.MIRROR) && (
                                <Content profile={profile} currentTab={currentTab} />
                            )}
                        {currentTab === TabType.NFT && (<NFTFeed profile={profile} />)}
                        {currentTab === TabType.ACTIVITIES && (<Activities txList={txList} />)}
                        {currentTab === TabType.RANKING && (<Ranking ranking={ranking} />)}
                    </div>


                </div>
            </div>

        </div>
    )
}

export default Profile