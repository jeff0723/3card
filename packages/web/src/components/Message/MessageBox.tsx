import React, { useEffect, useState } from "react";
import { Message, ListMessagesQuery, CreateMessageMutation, UpdateConversationMutation } from "API";
import GraphQLAPI, { graphqlOperation } from "@aws-amplify/api-graphql";
import { GraphQLSubscription } from '@aws-amplify/api';
import { listMessages } from "graphql/amplify/queries";
import { createMessage, updateConversation } from "graphql/amplify/mutations";
import { onCreateMessageByConversationId } from "graphql/amplify/subscriptions";
import { ChainChoice } from "pages/api/query/coingecko";

import { useAccount } from "wagmi";
import { API } from "aws-amplify";
import SingleMessage from "./SingleMessage";
import ping from "pages/api/query/coingecko";
import CoinGeckoApi from "pages/api/query/coingecko";

type Props = {
    conversationId: string;
    peerAddress: string;
    messages: Message[];
};

const MessageBox = ({ conversationId, peerAddress, messages }: Props) => {
    const { address } = useAccount();
    const [stateMessages, setStateMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const subscription = API.graphql<GraphQLSubscription<Message>>({
            query: onCreateMessageByConversationId,
            variables: {
                conversationId: conversationId
            }
        }).subscribe({
            next: (event: any) => {
                setStateMessages(
                    (prev) =>
                        [...prev, event.value.data.onCreateMessageByConversationId]

                )
            },
            error: (error: any) => {
                console.log(error)
            }
        });
        return () => {
            subscription.unsubscribe();
        }
    }, [conversationId, messages]);
    useEffect(() => {
        setStateMessages([...messages])
    }, [conversationId])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    };
    const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (message.trim() === '') return;
        try {
            const { data } = (await GraphQLAPI.graphql({
                query: createMessage,
                variables: {
                    input: {
                        conversationId: conversationId,
                        body: message,
                        sender: address,
                        receiver: peerAddress,
                    },
                },
            })) as { data: CreateMessageMutation };
            const { update } = (await GraphQLAPI.graphql({
                query: updateConversation,
                variables: {
                    input: {
                        conversationId: conversationId,
                        lastMessage: message,
                    },
                },
            })) as { update: UpdateConversationMutation }

        } catch (e) {
            console.log(e);
        } finally {
            setMessage("");
            const tokenList = ['bitcoin', 'ethereum', 'vetter-token']
            const fiatList = ['usd', 'eur']
            const binanceVetterAddress = '0x6169b3b23e57de79a6146a2170980ceb1f83b9e0'
            const ethereum1InchAddress = '0x111111111117dc0aa78b770fa6a738034120c302'
            const ethTokenList = ['0x111111111117dc0aa78b770fa6a738034120c302', '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984']
            const binanceChainName = 'binance-smart-chain'
            CoinGeckoApi.priceToUsdByTokenAddress(ethTokenList, ChainChoice.ethereum)
        }
        return false
    };
    return (
        <div className="h-full py-4 flex flex-col justify-end ">
            <div className="h-[700px] flex flex-col overflow-y-auto gap-2 py-4">
                {stateMessages
                    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                    .map((item, index) => (
                        <SingleMessage
                            key={index}
                            message={item.body}
                            user={address}
                            isMe={item.sender === address}
                            updateAt={item.updatedAt}
                        />
                    ))}
            </div>
            {/* <div className='flex justify-between py-2 px-2 border border-[#2F3336]'> */}
            <form className="flex justify-between py-2 px-2" onSubmit={handleSend}>
                <input
                    placeholder="Start a new message"
                    onChange={handleChange}
                    value={message}
                    className="bg-black focus:outline-none"
                />
                <button type="submit" className="text-primary-blue">
                    SEND
                </button>
            </form>
            {/* </div> */}
        </div>
    );
};

export default MessageBox;
