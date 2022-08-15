import * as dotenv from 'dotenv';
import AWS from 'aws-sdk';
dotenv.config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

export const S3 = new AWS.S3();

export const scanAPIKeyMap = new Map<string, string | undefined>([
    ['ether', process.env.ETHERSCAN_API_KEY],
    ['polygon', process.env.POLYGONSCAN_API_KEY],
    ['bsc', process.env.BSCSCAN_API_KEY],
]);

export type NormalTx = {
    blockNumber: string,
    timeStamp: string,
    hash: string,
    nonce: string,
    blockHash: string,
    transactionIndex: string,
    from: string,
    to: string,
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

export type ScanRankingResult = {
    account: string,
    chain: string,
    txlist: NormalTx[],
    ranking: Frequency[],
    endblock: number,
    awsinfo?: string,
};

export type ERC20Event = {
    blockNumber: string,
    timeStamp: string,
    hash: string,
    nonce: string,
    blockHash: string,
    from: string,
    contractAddress: string,
    to: string,
    value: string,
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

export type ERC20Asset = {
    contractAddress: string,
    tokenName: string,
    tokenSymbol: string,
    balance: string,
};

export type ScanERC20Result = {
    account: string,
    chain: string,
    erc20events: ERC20Event[],
    erc20assets: ERC20Asset[],
    endblock: number,
    awsinfo?: string,
};

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

export type ScanERC721Result = {
    account: string,
    chain: string,
    erc721events: ERC721Event[],
    erc721assets: ERC721Asset[],
    endblock: number,
    awsinfo?: string,
};

export const ERROR_MESSAGE = Object.freeze({
    INVALID_ADDRESS: 'invalid address',
    UNSPORTTED_CHAIN: 'unsuportted chain',
    AWS_QUERY_ERROR: 'aws query error',
    AWS_UPLOAD_ERROR: 'aws upload error',
    SCAN_QUERY_ERROR: 'scan query error',
});

export type ScanError = {
    account: string | string[] | undefined,
    chain: string,
    message: string,
    details?: string,
};