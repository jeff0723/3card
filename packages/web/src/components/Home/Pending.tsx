import { useQuery } from '@apollo/client'
import { Dialog } from '@headlessui/react'
import { TX_STATUS_QUERY } from 'graphql/query/has-transaction-hash-been-indexed'

import React, { FC } from 'react'
import toast from 'react-hot-toast'

interface Props {
    txHash?: string
}

const Pending: FC<Props> = ({ txHash }) => {
    const { data, loading } = useQuery(TX_STATUS_QUERY, {
        variables: {
            request: { txHash }
        },
        pollInterval: 1000,
        onError(error) {
            console.error('[Query Error]', error)
        },
        onCompleted(data) {
            console.log('[Query Completed]', data)
            toast.success("Profile created successfully<")
        }
    })

    return (
        <>
            {loading || !data?.hasTxHashBeenIndexed?.indexed ? (
                <div className="fixed inset-0 w-full h-screen z-50 overflow-hidden bg-black opacity-90 flex flex-col items-center pt-[32px]">
                    <div className='animate-spin rounded-full border-t-primary-blue border-black h-8 w-8 border-2' />
                    <h2 className="text-center text-white text-xl font-semibold">Loading...</h2>
                    <p className="w-1/3 text-center text-white">Your create profile transaction is indexing. Please wait a few seconds.</p>
                </div>) : <></>
            }
        </>
    )
}

export default Pending
