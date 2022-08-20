import { Card } from 'components/UI/Card'
import React from 'react'
import { Frequency, ADDRESS_TAGS } from 'scan-helper'
import Blockies from 'react-blockies';

interface Props {
    ranking: Frequency[]
}

const Ranking = ({ ranking }: Props) => {

    return (
        <>
            {
                ranking.map((fre, idx) => {
                    const address = fre.address ? (
                        ADDRESS_TAGS.has(fre.address) ?
                            ADDRESS_TAGS.get(fre.address) : fre.address)
                        :
                        'Contract Creation';

                    return <div key={idx} className='flex flex-col border-b border-border-gray pb-2'>
                        <div className='flex justify-between items-center'>
                            <div className='flex items-center gap-2'>
                                <Blockies seed={address as string} size={8} scale={4} className='rounded-full' />
                                {address}
                            </div>
                            <div>{fre.frequency}</div>
                        </div>
                    </div>
                }
                )
            }
        </>

    )
}

export default Ranking