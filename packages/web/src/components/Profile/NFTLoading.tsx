import { Card } from 'components/UI/Card'
import React from 'react'

type Props = {}

const NFTLoading = (props: Props) => {
    return (
        <Card>
            <div className="space-y-4 h-60 loading rounded-t-[10px]" />
            <div className="p-5 space-y-2 border-t">
                <div className="w-7/12 h-3 rounded-lg loading" />
                <div className="w-1/3 h-3 rounded-lg loading" />
            </div>
        </Card>
    )
}

export default NFTLoading