export const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY

export const API_URL = process.env.NEXT_PUBLIC_ENV === 'production'
    ? 'https://api.lens.dev'
    : 'https://api-mumbai.lens.dev'

export const IS_MAINNET = process.env.NEXT_PUBLIC_ENV === 'production' ? true : false

export const OPENSEA_URL = IS_MAINNET ? 'https://opensea.io' : 'https://testnets.opensea.io'
type ChainIdMap = { [chainId: number]: string }

export const CHAIN_TO_NAME: ChainIdMap = {
    1: 'ethereum',
    137: 'polygon',
    80001: 'mumbai',
    42: 'kovan'
}