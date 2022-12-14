export const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY

export const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ?? ''
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export const ETHERSCAN_URL = "https://etherscan.io"
export const API_URL = process.env.NEXT_PUBLIC_ENV === 'production'
    ? 'https://api.lens.dev'
    : 'https://api-mumbai.lens.dev'
export const APP_NAME = "3card"
export const IS_MAINNET = process.env.NEXT_PUBLIC_ENV === 'production' ? true : false

export const LENSHUB_PROXY = IS_MAINNET
    ? '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d'
    : '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82'
export const LENS_PERIPHERY = IS_MAINNET
    ? '0xeff187b4190E551FC25a7fA4dFC6cf7fDeF7194f'
    : '0xD5037d72877808cdE7F669563e9389930AF404E8'
export const OPENSEA_URL = IS_MAINNET ? 'https://opensea.io' : 'https://testnets.opensea.io'
type ChainIdMap = { [chainId: number]: string }

export const CHAIN_TO_NAME: ChainIdMap = {
    1: 'ethereum',
    137: 'polygon',
    80001: 'mumbai',
    42: 'kovan'
}

export const NEXT_API_KEY = process.env.NEXT_PUBLIC_ENDPOINT_URL ? process.env.NEXT_PUBLIC_API_KEY : undefined;

//address

export const FEE_COLLECT_MODULE = IS_MAINNET
    ? "0x1292E6dF9a4697DAAfDDBD61D5a7545A634af33d"
    : "0xeb4f3EC9d01856Cec2413bA5338bF35CeF932D82"

export const LIMITED_FEE_COLLECT_MODULE = IS_MAINNET
    ? "0xFCDA2801a31ba70dfe542793020a934F880D54aB"
    : "0x9fD74b1fC4F785e02EA8CC501980AeBB0dFFB38e"

export const TIMED_FEE_COLLECT_MODULE = IS_MAINNET
    ? "0xbf4E6C28d7f37C867CE62cf6ccb9efa4C7676F7F"
    : "0x36447b496ebc97DDA6d8c8113Fe30A30dC0126Db"

export const LIMITED_TIMED_FEE_COLLECT_MODULE = IS_MAINNET
    ? "0x7B94f57652cC1e5631532904A4A038435694636b"
    : "0xFCDA2801a31ba70dfe542793020a934F880D54aB"

export const REVERT_COLLECT_MODULE = IS_MAINNET
    ? "0xa31FF85E840ED117E172BC9Ad89E55128A999205"
    : "0x5E70fFD2C6D04d65C3abeBa64E93082cfA348dF8"

export const FREE_COLLECT_MODULE = IS_MAINNET
    ? "0x23b9467334bEb345aAa6fd1545538F3d54436e96"
    : "0x0BE6bD7092ee83D44a6eC1D949626FeE48caB30c"

export const FEE_FOllOW_MODULE = IS_MAINNET
    ? "0x80ae0e6048d6e295Ee6520b07Eb6EC4485193FD6"
    : "0xe7AB9BA11b97EAC820DbCc861869092b52B65C06"

export const REVERT_FOLLOW_MODULE = IS_MAINNET
    ? "0x6640e4Fb3fd56a6d7DfF3C351dFd9Ab7E57fb769"
    : "0x8c822Fc029EBdE62Da1Ed1072534c5e112dAE48c"

export const FOllOWER_ONLY_REFERENCE_MODULE = IS_MAINNET
    ? "0x17317F96f0C7a845FFe78c60B10aB15789b57Aaa"
    : "0x7Ea109eC988a0200A1F79Ae9b78590F92D357a16"