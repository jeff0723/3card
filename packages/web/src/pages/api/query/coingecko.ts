const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();

type TokenList = String[] | String
type FiatList = String[]

async function ping() {
    let data = await CoinGeckoClient.ping();
    console.log(data)
};

export enum ChainChoice {
    polygon = 'polygon-pos',
    bsc = 'binance-smart-chain',
    ethereum = 'ethereum',
}

async function priceToFiatByIds(tokenList: TokenList, fiatList: FiatList) {
    //if we want to get token price on other chain, could only get with coinIds
    let data = await CoinGeckoClient.simple.price({
        ids: tokenList,
        vs_currencies: fiatList,
    })
    console.log(data)
}

async function priceToUsdByTokenAddress(tokenAddresses: TokenList, assetPlatform: ChainChoice) {
    //only ethereum chain address is available
    let data = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: tokenAddresses,
        vs_currencies: 'usd'
    }, assetPlatform)
    console.log(data)
}

async function getTokenInfoByTokenAddress(address: String) {
    //only ethereum chain address is available

    let data = await CoinGeckoClient.coins.fetchCoinContractInfo(address)
    console.log(data)
}

const CoinGeckoApi = {
    ping,
    priceToFiatByIds,
    priceToUsdByTokenAddress,
    getTokenInfoByTokenAddress
}

export default CoinGeckoApi