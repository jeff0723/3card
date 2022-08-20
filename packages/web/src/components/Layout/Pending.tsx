import { useQuery } from '@apollo/client'
import { TX_STATUS_QUERY } from 'graphql/query/has-transaction-hash-been-indexed'

import { FC, useState } from 'react'
import toast from 'react-hot-toast'
interface Props {
    txHash?: string
}

const Pending: FC<Props> = ({ txHash }) => {

    const [pollInterval, setPollInterval] = useState<number>(1000)

    const { data, loading } = useQuery(TX_STATUS_QUERY, {
        variables: {
            request: { txHash }
        },
        pollInterval,
        onError(error) {
            console.error('[Query Error]', error)
        },
        onCompleted(data) {
            console.log('[Pulling Query Completed]', data)
            toast.loading("Profile creation tx indexing. If you see this message for more than a minute, please refresh the page.")
            setTimeout(() => {
                location.reload()
            }, 60000)
        }

    })
    return <></>
}

export default Pending
