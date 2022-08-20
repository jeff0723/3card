import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import { BigNumber, utils } from 'ethers';

dotenv.config();

const { isAddress } = utils;

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
    isError: boolean,
    txreceipt_status: number,
    input: string,
    contractAddress: string,
    cumulativeGasUsed: string,
    gasUsed: string,
    confirmations: string,
    methodId: string,
    functionName: string,
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

export type Frequency = {
    contractAddress: string,
    frequency: number,
}

export type ERC20Asset = {
    contractAddress: string,
    tokenName: string,
    tokenSymbol: string,
    balance: string,
};

export type FrequencyRanking = Array<Frequency>;

type TokenInfo = {
    tokenName: string,
    tokenSymbol: string,
    balance: BigNumber,
    decimal: string,
};

export class Scanner {
    
    // setup
    scanTxUrlMap: Map<string, string>;
    scanERC20UrlMap: Map<string, string>;    
    scanERC721UrlMap: Map<string, string>;    

    // target
    account: string;

    constructor(
        etherscanAPIKey: string,
        polygonscanAPIKey: string,
        bscscanAPIKey: string,
    ) {
        this.scanTxUrlMap = new Map<string, string>([
            ['ethereum', `https://api.etherscan.com/api?module=account&action=txlist&page=1&offset=10000&sort=asc&apikey=${etherscanAPIKey}`],
            ['polygon', `https://api.polygonscan.com/api?module=account&action=txlist&page=1&offset=10000&sort=asc&apikey=${polygonscanAPIKey}`],
            ['bsc', `https://api.bscscan.com/api?module=account&action=txlist&page=1&offset=10000&sort=asc&apikey=${bscscanAPIKey}`],
        ]);
        this.scanERC20UrlMap = new Map<string, string>([
            ['ethereum', `https://api.etherscan.io/api?module=account&action=tokentx&page=1&offset=10000&sort=asc&apikey=${etherscanAPIKey}`],
            ['polygon', `https://api.polygonscan.com/api?module=account&action=tokentx&page=1&offset=10000&sort=asc&apikey=${polygonscanAPIKey}`],
            ['bsc', `https://api.bscscan.com/api?module=account&action=tokentx&page=1&offset=10000&sort=asc&apikey=${bscscanAPIKey}`],
        ]);
        this.scanERC721UrlMap = new Map<string, string>([
            ['ethereum', `https://api.etherscan.io/api?module=account&action=tokennfttx&page=1&offset=10000&sort=asc&apikey=${etherscanAPIKey}`],
            ['polygon', `https://api.polygonscan.com/api?module=account&action=tokennfttx&page=1&offset=10000&sort=asc&apikey=${polygonscanAPIKey}`],
            ['bsc', `https://api.bscscan.com/api?module=account&action=tokennfttx&page=1&offset=10000&sort=asc&apikey=${bscscanAPIKey}`],
        ]);
    }

    target(account: string) {
        this.account = account.toLowerCase();
    }

    check(chain: string, startBlock: number): boolean {
        if (!isAddress(this.account)) {
            console.error("invalid target address");
            return false;
        }
        if (!this.scanTxUrlMap.has(chain)) {
            console.error("not supported chain");
            return false;
        }
        if (startBlock < 0) {
            console.error("scan from negative block number");
            return false;
        }
        return true;
    }

    async fetchNormalTxList(chain: string, startBlock: number): Promise<NormalTx[]> {
        if (!this.check(chain, startBlock)) return [];
        const queryURL = this.scanTxUrlMap.get(chain) + `&address=${this.account}&startblock=${startBlock}`;
        const res = await fetch(queryURL);
        return (await res.json()).result;
    }

    async fetchERC20EventList(chain: string, startBlock: number): Promise<ERC20Event[]> {
        if (!this.check(chain, startBlock)) return [];
        const queryURL = this.scanERC20UrlMap.get(chain) + `&address=${this.account}&startblock=${startBlock}`;
        const res = await fetch(queryURL);
        return (await res.json()).result;
    }

    async fetchERC721EventList(chain: string, startBlock: number): Promise<ERC20Event[]> {
        if (!this.check(chain, startBlock)) return [];
        const queryURL = this.scanERC721UrlMap.get(chain) + `&address=${this.account}&startblock=${startBlock}`;
        const res = await fetch(queryURL);
        return (await res.json()).result;
    }

    async getFrequencyRanking(normalTxList: NormalTx[]): Promise<FrequencyRanking> {
        const frequencyMap = new Map<string, number>();
        normalTxList.map((tx) => {
            const interactiveAddress = this.account === tx.from ? tx.to : tx.from;
            if (frequencyMap.has(interactiveAddress)) {
                const currFreq = frequencyMap.get(interactiveAddress);
                frequencyMap.set(interactiveAddress, currFreq+1);
            } else {
                frequencyMap.set(interactiveAddress, 1);
            }
        });
        const frequencyPairs = [...frequencyMap.entries()].sort((a,b) => b[1] - a[1]);
        return frequencyPairs.map(pair => ({
            contractAddress: pair[0],
            frequency: pair[1],
        }));
    }
    
    async getERC20Assets(erc20Events: ERC20Event[]): Promise<ERC20Asset[]> {
        const erc20assetsMap = new Map<string, TokenInfo>();
        erc20Events.map(event => {
        const tokenInfo = erc20assetsMap.get(event.contractAddress);
        if (event.to === event.from) return;
        const op = event.to === this.account.toLowerCase()? 'add': 'sub';
        erc20assetsMap.set(event.contractAddress, tokenInfo?{
        ...tokenInfo,
        balance: tokenInfo.balance[op](event.value),
        }:{
        tokenName: event.tokenName,
        tokenSymbol: event.tokenSymbol,
        balance: BigNumber.from(0)[op](event.value),
        decimal: event.tokenDecimal,
        })});
        return [...erc20assetsMap.entries()]
            .map(info => {
            return {
                contractAddress: info[0],
                tokenName: info[1].tokenName,
                tokenSymbol: info[1].tokenSymbol,
                balance: utils.formatUnits(info[1].balance, info[1].decimal),
            };
        });
    }
}

export const scanner = new Scanner(
    process.env.ETHERSCAN_API_KEY,
    process.env.POLYGONSCAN_API_KEY,
    process.env.BSCSCAN_API_KEY,
)