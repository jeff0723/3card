import { BigNumber } from 'ethers';
import { SupportedChainId, SCAN_API_KEYS } from './utils';

const CoinGecko = require('coingecko-api');

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

export type ERC20Result = {
    chainId: SupportedChainId,
    erc20events: ERC20Event[],
    erc20assets: ERC20Asset[],
    endblock: number,
};

type ERC20Info = {
    tokenName: string,
    tokenSymbol: string,
    balance: BigNumber,
    decimal: string,
};

const CoinGeckoClient = new CoinGecko();

export async function priceToUsdByTokenAddress(tokenAddresses: string[]) {
    //only ethereum chain address is available
    const data = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: tokenAddresses,
        vs_currencies: 'usd',
    })
    return data;
}

const SCAN_ERC20_URLS: { [key in SupportedChainId]: string } = {
    [SupportedChainId.MAINNET]: `https://api.etherscan.io/api?module=account&action=tokentx&page=1&offset=10000&sort=asc&apikey=${SCAN_API_KEYS[SupportedChainId.MAINNET]}`,
    [SupportedChainId.POLYGON]: `https://api.polygonscan.com/api?module=account&action=tokentx&page=1&offset=10000&sort=asc&apikey=${SCAN_API_KEYS[SupportedChainId.POLYGON]}`,
    [SupportedChainId.BSC]: `https://api.bscscan.com/api?module=account&action=tokentx&page=1&offset=10000&sort=asc&apikey=${SCAN_API_KEYS[SupportedChainId.BSC]}`,
}

export const updateERC20Result = async (address: string, erc20Result: ERC20Result): Promise<ERC20Result | undefined> => {
    address = address.toLowerCase();
    const chainId = erc20Result.chainId;
    const scanURL = SCAN_ERC20_URLS[chainId] + `&address=${address}&startblock=${erc20Result.endblock+1}`;
    const response = await fetch(scanURL);
    if (!response.ok) return;
    const content = await response.json();
    if (content.status === '0' || typeof content.result === 'string' ) return;
    const erc20EventList = content.result as ERC20Event[];
    const erc20events = [...erc20Result.erc20assets, ...erc20EventList];
    const ercInfoMap = new Map<string, ERC20Info>(
        
    );
    erc20EventList.map((event) => {
        if (event.from === event.to) return;
        const op = address === event.to ? 'add' : 'sub';
        const info = ercInfoMap.get(event.contractAddress);
        if (info) {
            ercInfoMap.set(event.contractAddress, {
                ...info,
                balance: info.balance[op](event.value),
            });
        } else {
            ercInfoMap.set(event.contractAddress, {
                tokenName: event.tokenName,
                tokenSymbol: event.tokenSymbol,
                balance: BigNumber.from(0)[op](event.value),
                decimal: event.tokenDecimal,
            });
        }
    });
    const erc20assets = erc20Result.erc20assets;

}