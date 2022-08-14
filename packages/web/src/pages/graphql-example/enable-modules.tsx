// @refresh reset
import { useQuery } from '@apollo/client'
import { ENABLED_MODULES } from 'graphql/query/enable-module'
import { CURRENT_USER_QUERY } from 'graphql/query/user'
import type { NextPage } from 'next'
import { useAccount, useDisconnect, useNetwork } from 'wagmi'

type Props = {}

const EnableModule: NextPage<Props> = (props: Props) => {

    const { data, loading } = useQuery(ENABLED_MODULES, {
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
        <div>hi
        </div>
    )
}

export default EnableModule