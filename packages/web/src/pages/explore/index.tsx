import React, { FC, useState } from 'react'
import type { NextPage } from 'next'
import { useQuery } from '@apollo/client'
import { EXPLORE_COMMUNITY_QUERY } from 'graphql/query/community-query'
import { APP_NAME } from 'constants/constants'
import Link from 'next/link'

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
    const [communities, setCommunities] = useState([])
    const { data, loading, error } = useQuery(EXPLORE_COMMUNITY_QUERY, {
        variables: {
            request: {
                sources: `${APP_NAME} Community`,
                sortCriteria: 'TOP_COLLECTED',
                publicationTypes: ['POST']
            },

        },
        onCompleted: (data) => {
            console.log(data)
        },
        onError: (error) => {
            console.error('[Query Error]', error)
        }
    })
    return (
        <div className='flex flex-col px-4 gap-4 overflow-y-auto'>
            <div>
                <div className='text-[20px] font-bold'>
                    Explore
                </div>
                <div className='text-gray-400'>
                    Explore the best community in web3
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <div className='text-[20px] font-bold'>NFT </div>
                <div className='flex flex-wrap gap-4'>
                    <BaycDao />
                    <BaycDao />
                    <BaycDao />

                    <BaycDao />
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <div className='text-[20px] font-bold'>DeFi </div>
                <div className='flex flex-wrap gap-4'>
                    <BaycDao />
                    <BaycDao />
                    <BaycDao />

                    <BaycDao />
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <div className='text-[20px] font-bold'>DAO </div>
                <div className='flex flex-wrap gap-4'>
                    <BaycDao />
                    <BaycDao />
                    <BaycDao />

                    <BaycDao />
                </div>
            </div>
        </div>
    )
}

export default index