import type { NextApiRequest, NextApiResponse } from 'next';

const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
// type TokenList = String[]
// type FiatList = String[]



export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    console.log(req.query)
    const { tokenAddress } = req.query;

    if (!tokenAddress) {
        res.status(500).json({
            tokenAddress,
            message: 'no address detected'
        });
    } else {
        try {
            const data = await CoinGeckoClient.simple.fetchTokenPrice({
                contract_address: tokenAddress,
                vs_currencies: 'usd',
            })
            res.status(200).json(data);
        } catch (e) {
            console.log(e)
            console.log('something wrong')
            res.status(500).json(e)
        }
    }
}



// async function priceToFiatByIds(tokenList: TokenList, fiatList: FiatList) {
//     //if we want to get token price on other chain, could only get with coinIds
//     let data = await CoinGeckoClient.simple.price({
//         ids: tokenList,
//         vs_currencies: fiatList,
//     })
//     console.log(data)
// }

// async function priceToUsdByTokenAddress(address: String) {
//     //only ethereum chain address is available
//     let data = await CoinGeckoClient.simple.fetchTokenPrice({
//         contract_addresses: address,
//         vs_currencies: 'usd',
//     })
//     console.log(data)
// }

// async function getTokenInfoByTokenAddress(address: String) {
//     //only ethereum chain address is available

//     let data = await CoinGeckoClient.coins.fetchCoinContractInfo(address)
//     console.log(data)
// }

// const CoinGeckoApi = {
//     priceToFiatByIds,
//     priceToUsdByTokenAddress,
//     getTokenInfoByTokenAddress
// }

// const tokenList = ['bitcoin', 'ethereum', 'vetter-token']
// const fiatList = ['usd', 'eur']
// const binanceVetterAddress = '0x6169b3b23e57de79a6146a2170980ceb1f83b9e0'
// const ethereum1InchAddress = '0x111111111117dc0aa78b770fa6a738034120c302'
// CoinGeckoApi.priceToFiatByIds(tokenList, fiatList)
// CoinGeckoApi.priceToUsdByTokenAddress(binanceVetterAddress)
// CoinGeckoApi.getTokenInfoByTokenAddress(ethereum1InchAddress)
// }