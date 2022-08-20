const CoinGecko = require('coingecko-api');
import { ethers } from 'ethers';

export const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_INFURA_MAINNET_URL,
);

export const scanAPIKeyMap = new Map<string, string | undefined>([
    ['ether', process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY],
    ['polygon', process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY],
    ['bsc', process.env.NEXT_PUBLIC_BSCSCAN_API_KEY],
]);

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
    addressEnsName?: string,
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

export const CoinGeckoClient = new CoinGecko();

export async function priceToUsdByTokenAddress(tokenAddresses: string[]) {
    //only ethereum chain address is available
    const data = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: tokenAddresses,
        vs_currencies: 'usd'
    })
    return data;
}

export const ADDRESS_TAGS = new Map<string, string>([
    ['0x7a250d5630b4cf539739df2c5dacb4c659f2488d', 'Uniswap V2 Router'],
    ['0x7be8076f4ea4a4ad08075c2508e481d6c946d12b', 'Opensea V1'],
    ['0x283af0b28c62c092c9727f1ee09c02ca627eb7f5', 'ENS'],
    ['0x7f268357a8c2552623316e2562d90e642bb538e5', 'Opensea V2'],
    ['0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', 'Uniswap V3 Router'],
    ['0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f', 'SushiSwap Router'],
    ['0xe592427a0aece92de3edee1f18e0157c05861564', 'Uniswap V3 Router'],
    ['0xdef1c0ded9bec7f1a1670819833240f027b25eff', 'OxExchage'],
    ['0xc098b2a3aa256d2140208c3de6543aaef5cd3a94', 'FTX'],
    ['0x881d40237659c251811cec9c364ef91dc08d300c', 'Metamask swap'],
    ['0x00000000006c3852cbef3e08e8df289169ede581', 'Seaport'],
    ['0xa0c68c638235ee32657e8f720a23cec1bfc77c77', 'Polygon Brdige'],
    ['0xabea9132b05a70803a4e85094fd0e1800777fbef', 'zkSync'],
    ['0xf1f3ca6268f330fda08418db12171c3173ee39c9', 'Zapper'],
    ['0xc36442b4a4522e871399cd717abdd847ab11fe88', 'Uniswap V3 Position'],
    ['0x8d12a197cb00d4747a1fe03395095ce2a5cc6819', 'EtherDelta2'],
    ['0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9', 'Aave Lending V1'],
    ['0x084b1c3c81545d370f3634392de611caabff8148', 'ENS'],
    ['0xba12222222228d8ba445958a75a0704d566bf2c8', 'Balancer Vault'],
    ['0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85', 'ENS'],
    ['0x1111111254fb6c44bac0bed2854e76f90643097d', '1inch V4 Router'],
    ['0x4dbd4fc535ac27206064b68ffcf827b0a60bab3f', 'Arbitrum'],
    ['0xdef171fe48cf0115b1d80b88dc8eab59176fee57', 'Paraswap V5 Router'],
    ['0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41', 'ENS'],
    ['0xae7ab96520de3a18e5e111b5eaab095312d7fe84', 'Lido'],
    ['0xfaff15c6cdaca61a4f87d329689293e07c98f578', 'Zapper NFT'],
    ['0xcda72070e455bb31c7690a170224ce43623d0b6f', 'Foundation Market'],
    ['0x11111112542d85b3ef69ae05771c2dccff4faa26', '1inch V3 Router'],
    ['0xfd43d1da000558473822302e1d44d81da2e4cc0d', 'Love Death + Robots'],
    ['0x398ec7346dcd622edc5ae82352f02be94c62d119', 'Aave Lending V1'],
    ['0x56eddb7aa87536c09ccc2793473599fd21a8b17f', 'Binance'],
    ['0xa7efae728d2936e78bda97dc267687568dd593f3', 'OKEx 3'],
    ['0x737901bea3eeb88459df9ef1be8ff3ae1b42a2ba', 'Aztec Rollup'],
    ['0x9696f59e4d72e237be84ffd425dcad154bf96976', 'Binance'],
    ['0xba17eeb3f0413b76184ba8ed73067063fba6e2eb', "ETH Global"]
]);