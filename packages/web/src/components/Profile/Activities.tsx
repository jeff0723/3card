import { Card } from 'components/UI/Card'
import React from 'react'
import { NormalTx, ADDRESS_TAGS } from 'scan-helper'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { HiArrowNarrowDown } from 'react-icons/hi'
import { BigNumber, utils } from 'ethers'

dayjs.extend(relativeTime)

interface Props {
    txList: NormalTx[]
}

const getGasFee = (gasUsed: string, gasPrice: string): string => {
    return utils.formatEther(BigNumber.from(gasUsed).mul(gasPrice));
}
const getETH = (wei: string): string => {
    return utils.formatEther(BigNumber.from(wei));
}
const formatAddress = (address: string): string => {
    if (address.startsWith('0x')) {
        return address.slice(0, 6) + '...' + address.slice(address.length - 4)
    }
    return address
}
const Activities = ({ txList }: Props) => {
    // console.log(txList)
    return (
        <>
            {
                txList?.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp))
                    .map((tx, idx) => {
                        const from = ADDRESS_TAGS.has(tx.from) ? ADDRESS_TAGS.get(tx.from) : tx.from;
                        const to = ADDRESS_TAGS.has(tx.to) ? ADDRESS_TAGS.get(tx.to) : tx.to;
                        const fxName = tx.contractAddress ? 'DEPLOY' : (tx.functionName ?
                            tx.functionName.split('(')[0] : 'NATIVE TRANSFER');
                        return (
                            <div key={idx}>
                            <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" key={tx.hash}>
                                <div className='border-b border-border-gray py-2 grid grid-cols-3 w-full'>
                                    <div className='flex flex-col'>
                                        <div className='w-fit p-2 rounded-lg bg-green-400 bg-opacity-10 text-green-400'>{fxName}</div>
                                        <p className='text-gray-400'>{dayjs(new Date(parseInt(tx.timeStamp) * 1000)).fromNow()}</p>

                                    </div>
                                    <div className='flex flex-col justify-center'>

                                        <div>From:
                                            <a href={`https://etherscan.io/address/${tx.from}`} target='_blank' rel='noopener noreferrer'>
                                                <span className='text-primary-blue hover:underline ml-2'>{formatAddress(from as string)}</span>
                                            </a>
                                        </div>

                                        <div>To:
                                            <a href={`https://etherscan.io/address/${tx.to}`} target='_blank' rel='noopener noreferrer'>
                                                <span className='text-primary-blue hover:underline ml-2'>{formatAddress(to as string)}</span>
                                            </a>
                                        </div>

                                    </div>

                                    <div className='flex flex-col justify-center'>
                                        <p>Gas fee: {getGasFee(tx.gasUsed, tx.gasPrice).slice(0, 5)} ETH</p>
                                        <p>Value: {getETH(tx.value).slice(0, 5)} ETH</p>
                                    </div>
                                </div>
                            </a>
                            </div>
                        )
                    }
                    )
            }
        </>

    )
}

export default Activities