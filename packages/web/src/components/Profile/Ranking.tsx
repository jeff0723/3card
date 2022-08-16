import { Card } from 'components/UI/Card'
import React from 'react'
import { Frequency, ADDRESS_TAGS } from 'scan-helper'

interface Props {
    ranking: Frequency[]
}

const Ranking = ({ ranking }: Props) => {

    return (
        <>
            {
                ranking.map(fre => {
                    const address = fre.address? (
                        ADDRESS_TAGS.has(fre.address)?
                            ADDRESS_TAGS.get(fre.address) : fre.address)
                            :
                        'Contract Creation';
                    
                    return <>
                        <p>{address}:{fre.frequency}</p>
                        <Card children={null}/>
                    </>
                    }
                )
            }
        </>

    )
}

export default Ranking