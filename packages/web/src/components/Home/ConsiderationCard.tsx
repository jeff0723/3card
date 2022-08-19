import React from 'react'
import { ConsiderationInputItem, ConsiderationItem } from '@opensea/seaport-js/lib/types';
import { ItemType } from '@opensea/seaport-js/lib/constants';
import { ethers } from 'ethers';
import { trimAddress } from './SelectNFT';

type Props = {
    consideration: ConsiderationInputItem | ConsiderationItem;
}
const ItemMap = {
    [ItemType.ERC721]: "ERC721",
    [ItemType.ERC1155]: "ERC1155",
    [ItemType.ERC20]: "ERC20",
    [ItemType.NATIVE]: "NATIVE",
}
const ConsiderationCard = ({ consideration }: Props) => {
    const token = consideration.token ? "identifier" in consideration ? `${trimAddress(consideration.token)} - id: ${consideration.identifier}` : trimAddress(consideration.token) : "";
    const amount = "amount" in consideration ? "itemType" in consideration ? consideration.amount :
        ethers.utils.formatEther(consideration.amount) : "1";
    return (
        <div className='w-full rounded-xl border border-border-gray p-4 flex justify-between'>
            {
                "itemType" in consideration ?
                    // @ts-ignore
                    <div>{ItemMap[consideration.itemType]} x {amount}</div> :
                    "token" in consideration ?
                        <div>ERC20</div> :
                        <div>NATIVE Token</div>
            }
            {<div className='text-gray-400'>{token}</div>}
            {!("itemType" in consideration) && amount}




        </div>
    )
}

export default ConsiderationCard