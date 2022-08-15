import { useRouter } from 'next/router'
import React from 'react'
import type { NextPage } from 'next'

type Props = {}

const Community: NextPage = (props: Props) => {
    const { query: { community_id } } = useRouter()
    return (
        <div className='w-full'>
            <div className='h-10 sm:h-20 bg-white bg-opacity-50' />
            <div className='grid grid-cols-9 w-full'>
                <div className='col-start-3 col-span-5 h-full'>
                    hi
                </div>
            </div>
        </div>
    )
}

export default Community