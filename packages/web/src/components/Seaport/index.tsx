import type { GetServerSideProps, NextPage } from 'next'
import React, { useContext, useEffect, useState } from 'react'
import { Seaport } from "@opensea/seaport-js";
import { useSigner, useProvider, useConnect, useAccount } from 'wagmi'
import { Signer, providers, ethers } from 'ethers';
import SeaportContext from 'contexts/seaport';
import { ItemType } from '@opensea/seaport-js/lib/constants';
import { OrderParameters, OrderWithCounter } from '@opensea/seaport-js/lib/types';
import getIPFSLink from 'utils/getIPFSLink';
import { uploadIpfs } from 'utils/uploadToIPFS';
type Props = {}

const SeaportPage: NextPage = (props: Props) => {
    const { seaport } = useContext(SeaportContext)
    const [order, setOrder] = useState<OrderWithCounter>()
    const { address } = useAccount()
    const createOrder = async () => {
        //@ts-ignore
        const { executeAllActions } = await seaport?.createOrder({
            offer: [
                {
                    itemType: ItemType.ERC721,
                    token: "0x2f201Dcc51Dd30B060F1339ed55fAeE5b82F6F38",
                    identifier: "13"
                }
            ],
            consideration: [
                {
                    amount: ethers.utils.parseEther("0.01").toString(),
                    recipient: address
                },
            ],
        })
        const order = await executeAllActions();
        setOrder(order)
        console.log("order:", order)
        const {path } = await uploadIpfs(order)
        console.log("cid:", path)

    }
    const fullfillOrder = async () => {
        console.log('start to fulfill order')
        if (order) {

            //@ts-ignore
            const { executeAllActions: executeAllFulfillActions } =
                await seaport?.fulfillOrder({
                    order,
                    accountAddress: address,
                });

            const transaction = executeAllFulfillActions();
        }
    }
    // console.log(address)
    return (
        <div>
            <button onClick={createOrder}>Create Order</button>
            {order && <div onClick={fullfillOrder}>
                {order.signature}
            </div>}
            <button onClick={fullfillOrder}>Fullfill Order</button>
        </div>
    )
}

export default SeaportPage