import React, { FC, useState } from 'react'
import type { NextPage } from 'next'
import { useQuery } from '@apollo/client'
import { EXPLORE_COMMUNITY_QUERY } from 'graphql/query/community-query'
import { APP_NAME } from 'constants/constants'
import Link from 'next/link'
import { Publication } from 'generated/types'
import CommunityCard from 'components/UI/CommunityCard'

type Props = {}

const BaycDao: FC = () => (
    <div className='flex max-w-[275px] gap-2 py-2 px-4 rounded-lg border border-border-gray'>
        <div className='flex items-center'>
            <img src='https://img.seadn.io/files/2e17aa8e5388382edefbe5280ca8daed.png' className='rounded-lg' width={80} height={80} />
        </div>
        <div className='flex flex-col'>
            <div className='font-bold'>BAYC DAO</div>
            <div className='text-gray-400'>A bunch of boring human exporing the world</div>
            <div className='flex gap-2 text-gray-500'>
                <div>10 members</div>
                <div>14 members</div>
            </div>
        </div>
    </div>
)
const index: NextPage = (props: Props) => {
    const [communities, setCommunities] = useState<{ [key: string]: Publication[] }>({
        defi: [],
        nft: [],
        dao: [],
        general: [],
    })
    const { data, loading, error } = useQuery(EXPLORE_COMMUNITY_QUERY, {
        variables: {
            request: {
                sources: `${APP_NAME} Community`,
                sortCriteria: 'TOP_COLLECTED',
                publicationTypes: ['POST']
            },

        },
        errorPolicy: "all",
        onCompleted: (data) => {
            const defi = data?.communities?.items?.filter((publication: Publication) => publication?.metadata?.attributes[1]?.value === 'DEFI')
            const dao = data?.communities?.items?.filter((publication: Publication) => publication?.metadata?.attributes[1]?.value === 'NFT')
            const nft = data?.communities?.items?.filter((publication: Publication) => publication?.metadata?.attributes[1]?.value === 'DAO')
            const general = data?.communities?.items?.filter((publication: Publication) => publication?.metadata?.attributes[1]?.value === 'GENERAL')
            setCommunities({ defi, dao, nft, general })

        },
        onError: (error) => {
            console.error('[Query Error]', error)
        }
    })
    return (
        <div className='flex flex-col px-4 gap-4 overflow-y-auto'>
            <div>
                <div className='text-[32px] font-bold'>
                    Explore
                </div>
                <div className='text-[20px] text-gray-400'>
                    Explore the best community in web3
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <div className='text-[20px] font-bold'>NFT </div>
                <div className='flex flex-wrap gap-4'>
                    {
                        communities?.nft?.map((community: Publication, index) => (
                            <CommunityCard key={`${index} + nft`} community={community} />
                        ))
                    }
                    {
                        !loading && communities?.nft?.length === 0 && (
                            <div className='text-[15px]'>
                                No Community yet
                            </div>
                        )
                    }
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <div className='text-[20px] font-bold'>DeFi </div>
                <div className='flex flex-wrap gap-4'>
                    {
                        communities?.defi?.map((community: Publication, index) => (
                            <CommunityCard key={`${index} + defi`} community={community} />
                        ))
                    }
                    {
                        !loading && communities?.defi?.length === 0 && (
                            <div className='text-[15px]'>
                                No Community yet
                            </div>
                        )
                    }
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <div className='text-[20px] font-bold'>DAO </div>
                <div className='flex flex-wrap gap-4'>
                    {
                        communities?.dao?.map((community: Publication, index) => (
                            <CommunityCard key={`${index} + dao`} community={community} />
                        ))
                    }
                    {
                        !loading && communities?.dao?.length === 0 && (
                            <div className='text-[15px]'>
                                No Community yet
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default index