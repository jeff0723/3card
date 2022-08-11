import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import { utils } from 'ethers';

dotenv.config();

const { isAddress } = utils;

export type NormalTrasaction = {
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

export type NormalTxList = Array<NormalTrasaction>;
export type FrequencyRanking = Array<Frequency>;
export type ERC20EventList = Array<ERC20Event>;
export type ERC20AssetList = Array<any>;
export type ERC721EventList = Array<ERC721Event>;
export type ERC721AssetList = Array<any>;

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

    async fetchNormalTxList(chain: string, startBlock: number): Promise<NormalTxList> {
        if (!this.check(chain, startBlock)) return [];
        const queryURL = this.scanTxUrlMap.get(chain) + `&address=${this.account}&startblock=${startBlock}`;
        const res = await fetch(queryURL);
        return (await res.json()).result;
    }

    async fetchERC20EventList(chain: string, startBlock: number): Promise<ERC20EventList> {
        if (!this.check(chain, startBlock)) return [];
        const queryURL = this.scanERC20UrlMap.get(chain) + `&address=${this.account}&startblock=${startBlock}`;
        const res = await fetch(queryURL);
        return (await res.json()).result;
    }

    async fetchERC721EventList(chain: string, startBlock: number): Promise<ERC20EventList> {
        if (!this.check(chain, startBlock)) return [];
        const queryURL = this.scanERC721UrlMap.get(chain) + `&address=${this.account}&startblock=${startBlock}`;
        const res = await fetch(queryURL);
        return (await res.json()).result;
    }

    async getFrequencyRanking(normalTxList: NormalTxList): Promise<FrequencyRanking> {
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
}

export const scanner = new Scanner(
    process.env.ETHERSCAN_API_KEY,
    process.env.POLYGONSCAN_API_KEY,
    process.env.BSCSCAN_API_KEY,
)