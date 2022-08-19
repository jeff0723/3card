// @refresh reset
import { useQuery } from '@apollo/client'
import { GET_PROFILE_BY_ADDRESS } from 'graphql/query/user'
import type { NextPage } from 'next'
import { useAccount, useDisconnect, useNetwork } from 'wagmi'

type Props = {}

const GetUser: NextPage<Props> = (props: Props) => {
    const { address, isDisconnected, isConnected } = useAccount()
    const { chain } = useNetwork()
    const { disconnect } = useDisconnect()
    const { data, loading } = useQuery(GET_PROFILE_BY_ADDRESS, {
        variables: { ownedBy: address },
        skip: !isConnected,
        onCompleted(data) {
            console.log(data)
        },
        onError(error) {
            console.log(error)
        }

    })
    return (
        <div>hi:{address}

        </div>
    )
}

export default GetUser