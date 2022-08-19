// @refresh reset
import { useQuery } from '@apollo/client'
import { ENABLED_MODULES } from 'graphql/query/enable-module'
import type { NextPage } from 'next'

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

    return (
        <div>hi
        </div>
    )
}

export default EnableModule