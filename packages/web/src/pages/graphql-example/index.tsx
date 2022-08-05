import { useQuery } from '@apollo/client'
import { CURRENT_USER_QUERY } from 'graphql/current-user'
import type { NextPage } from 'next'
import { useAccount, useDisconnect, useNetwork } from 'wagmi'

type Props = {}

const index: NextPage<Props> = (props: Props) => {
    return (
        <div>index</div>
    )
}

export default index