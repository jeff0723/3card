import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
// import { utils, BigNumber } from 'ethers';

dotenv.config();

// const { hexZeroPad, hexDataSlice } = utils;

export type TxList = Array<any>;
export type ERC20EventList = Array<any>;
export type ERC721EventList = Array<any>;
export type ERC20AssetList = Array<any>;
export type ERC721AssetList = Array<any>;

export class Scanner {
    
    // setup
    scanTxUrlMap: Map<string, string>;
    scanERC20UrlMap: Map<string, string>;    
    scanERC721UrlMap: Map<string, string>;    

    // config
    chain: string;
    account: string;
    startBlock: number;

    // result
    txList: TxList;
    erc20EventList: ERC20EventList;
    erc721EventList: ERC721EventList;
    erc20AssetList: ERC20AssetList;
    erc721AssetList: ERC721AssetList;

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

        this.chain = '';
        this.account = '';
        this.startBlock = -1;
        this.txList = [];
        this.erc20EventList = [];
        this.erc721EventList = [];
    }

    config(chain?: string, account?: string, startBlock?: number) {
        this.chain = chain?chain:this.chain;
        this.account = account?account.toLowerCase():this.account;
        this.startBlock = startBlock >= 0?startBlock:this.startBlock;
    }

    check(): boolean {
        if (!this.chain || !this.account || this.startBlock < 0) {
            console.error("please config first");
            return false;
        }
        if (!this.scanTxUrlMap.has(this.chain)) {
            console.error("not supported chain");
            return false;
        }
        return true;
    }

    async fetchTxList(): Promise<boolean> {
        if (!this.check()) return false;
        const queryURL = this.scanTxUrlMap.get(this.chain) + `&address=${this.account}&startblock=${this.startBlock}`;
        const res = await fetch(queryURL);
        this.txList = (await res.json()).result;
        return true;
    }

    async fetchERC20EventList(): Promise<boolean> {
        if (!this.check()) return false;
        const queryURL = this.scanERC20UrlMap.get(this.chain) + `&address=${this.account}&startblock=${this.startBlock}`;
        try {
            const res = await fetch(queryURL);
            this.erc20EventList = (await res.json()).result;
            return true;
        } catch (err) {
            this.erc20EventList = [];
            return false;
        }
    }

    async fetchERC721EventList(): Promise<boolean> {
        if (!this.check()) return false;
        const queryURL = this.scanERC721UrlMap.get(this.chain) + `&address=${this.account}&startblock=${this.startBlock}`;
        try {
            const res = await fetch(queryURL);
            this.erc721EventList = (await res.json()).result;
            return true;
        } catch (err) {
            this.erc721EventList = [];
            return false;
        }
    }

    async getFrequency(): Promise<Map<string, number>> {
        const frequencyMap = new Map<string, number>();
        this.txList.map((tx) => {
            const interactiveAddress = this.account === tx.from ? tx.to : tx.from;
            if (frequencyMap.has(interactiveAddress)) {
                const currFreq = frequencyMap.get(interactiveAddress);
                frequencyMap.set(interactiveAddress, currFreq);
            } else {
                frequencyMap.set(interactiveAddress, 1);
            }
        });
        return new Map([...frequencyMap.entries()].sort((a,b) => b[1] - a[1]));
    }
}