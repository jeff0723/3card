export type NormalTx = {
    blockNumber: string,
    timeStamp: string,
    hash: string,
    nonce: string,
    blockHash: string,
    transactionIndex: string,
    from: string,
    fromEnsName?: string,
    to: string,
    toEnsName?: string,
    value: string,
    gas: string,
    gasPrice: string,
    isError: string,
    txreceipt_status: string,
    input: string,
    contractAddress: string,
    cumulativeGasUsed: string,
    gasUsed: string,
    confirmations: string,
    methodId: string,
    functionName: string,
};

export type Frequency = {
    address: string,
    frequency: number,
}

export type RankingResult = {
    chain: string,
    txlist: NormalTx[],
    ranking: Frequency[],
    endblock: number,
};