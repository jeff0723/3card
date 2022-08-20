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
    ['0xba17eeb3f0413b76184ba8ed73067063fba6e2eb', 'ETH Global'],
    ['0x6b175474e89094c44da98b954eedeac495271d0f', 'Dai Stablecoin'],
    ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 'USDC'],
    ['0x5d3a536e4d6dbd6114cc1ead35777bab948e3643', 'Compound'],
    ['0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b', 'Compound'],
    ['0x92be6adb6a12da0ca607f9d87db2f9978cd6ec3e', 'Zapper'],
    ['0xca21d4228cdcc68d4e23807e5e370c07577dd152', 'Zorbs'],
    ['0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e', 'Yearn.fi'],
    ['0x99c9fc46f92e8a1c0dec1b1747d010903e884be1', 'Optimism'],
    ['0x3b484b82567a09e2588a13d54d032153f0c0aee0', 'SOS'],
    ['0x52ec2f3d7c5977a8e558c8d9c6000b615098e8fc', 'Optimism'],
    ['0x28c6c06298d514db089934071355e5743bf21d60', 'Binance'],
    ['0x469788fe6e9e9681c6ebf3bf78e7fd26fc015446', 'Snapshot'],
    ['0x4976a4a02f38326660d17bf34b431dc6e2eb2327', 'Binance'],
    ['0xdac17f958d2ee523a2206206994597c13d831ec7', 'USDT'],
    ['0xae0ee0a63a2ce6baeeffe56e7714fb4efe48d419', 'StarkNet'],
    ['0x2face815247a997eaa29881c16f75fd83f4df65b', 'RabbitHole'],
    ['0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88', 'MEXC'],
    ['0xde30da39c46104798bb5aa3fe8b9e0e1f348163f', 'GitCoin'],
    ['0x83c8f28c26bf6aaca652df1dbbe0e1b56f8baba2', 'GemSwap 2'],
    ['0xb8901acb165ed027e32754e0ffe830802919727f', 'Hop Protocol'],
    ['0xbf92a355c73de74969a75258e02a15a2764d4970', '8GON'],
    ['0xa3b61c077da9da080d22a4ce24f9fd5f139634ca', 'RabbitHole NFT'],
    ['0x2aea4add166ebf38b63d09a75de1a7b94aa24163', 'KudosToken'],
    ['0xd945f759d422ae30a6166838317b937de08380e3', 'Zora Hackathon'],
    ['0x932261f9fc8da46c4a22e31b45c4de60623848bf', 'Zerion DNA '],
    ['0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7', 'Zora'],
    ['0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', 'UNI'],
    ['0x80c67432656d59144ceff962e8faf8926599bcf8', 'Orbiter Bridge'],
    ['0x74ee68a33f6c9f113e22b3b77418b75f85d07d22', 'Zerion Genesis'],
    ['0xcc8fa225d80b9c7d42f96e9570156c65d6caaa25', 'SLP Token'],
    ['0xcd4ec7b66fbc029c116ba9ffb3e59351c20b5b06', 'Rarible'],
    ['0x1a2a1c938ce3ec39b6d47113c7955baa9dd454f2', 'Ronin Bridge'],
    ['0x71c4658acc7b53ee814a29ce31100ff85ca23ca7', 'GalaXY Kats'],
    ['0x88acdd2a6425c3faae4bc9650fd7e27e0bebb7ab', 'Alchemist'],
]);