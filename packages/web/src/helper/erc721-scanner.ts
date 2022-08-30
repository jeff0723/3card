export type ERC721Event = {
    blockNumber: string,
    timeStamp: string,
    hash: string,
    nonce: string,
    blockHash: string,
    from: string,
    contractAddress: string,
    to: string,
    tokenID: string,
    tokenName: string,
    tokenSymbol: string,
    tokenDecimal: string,
    transactionIndex: string,
    gas: string,
    gasPrice: string,
    gasUsed: string,
    cumulativeGasUsed: string,
    input: string,
    confirmations: string,
};

export type ERC721Asset = {
    contractAddress: string,
    tokenName: string,
    tokenSymbol: string,
    tokenIdList: string[],
};

export type ERC721Result = {
    chain: string,
    erc721events: ERC721Event[],
    erc721assets: ERC721Asset[],
    endblock: number,
};