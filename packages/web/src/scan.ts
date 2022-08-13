import * as dotenv from 'dotenv';
dotenv.config();

export const scanAPIKeyMap = new Map<string, string | undefined>([
    ['ether', process.env.etherscanAPIKey],
    ['polygon', process.env.polygonscanAPIKey],
    ['bsc', process.env.bscscanAPIKey],
]);