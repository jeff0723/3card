// @refresh reset
import { useQuery } from '@apollo/client'
import { CURRENT_USER_QUERY } from 'graphql/query/user'
import type { NextPage } from 'next'
import { useAccount, useDisconnect, useNetwork } from 'wagmi'

type Props = {}

const GetUser: NextPage<Props> = (props: Props) => {
    const { address, isDisconnected, isConnected } = useAccount()
    const { chain } = useNetwork()
    const { disconnect } = useDisconnect()
    const { data, loading } = useQuery(CURRENT_USER_QUERY, {
        variables: { ownedBy: address },
        skip: !isConnected,
        onCompleted(data) {
            console.log(data)
        },
        onError(error) {
            console.log(error)
        }

    })
    console.log('loading', loading)
    console.log('data', data)
    return (
        <div>hi:{address}

        </div>
    )
}

export default GetUser