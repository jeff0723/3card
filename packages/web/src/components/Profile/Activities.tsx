import { Card } from 'components/UI/Card'
import React from 'react'
import { NormalTx, ADDRESS_TAGS } from 'scan-helper'

interface Props {
    txList: NormalTx[]
}

const Activities = ({ txList }: Props) => {

    return (
        <>
            {
                txList.map(tx => {
                    const from = ADDRESS_TAGS.has(tx.from)?ADDRESS_TAGS.get(tx.from):tx.from;
                    const to = ADDRESS_TAGS.has(tx.to)?ADDRESS_TAGS.get(tx.to):tx.to;
                    const fxName = tx.contractAddress? 'DEPLOY' : (tx.functionName?
                        tx.functionName.split('(')[0]: 'NATIVE TRANSFER');
                    return <>
                        <p>{from}</p>
                        <p>{fxName}</p>
                        <p>{to}</p>
                        <Card children={null}/>
                    </>
                    }
                )
            }
        </>

    )
}

export default Activities