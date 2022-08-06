import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { S3 } from './aws';
import { readFileSync } from 'fs';

dotenv.config();

const etherscanAPIKey = process.env.ETHERSCAN_API_KEY;
// const polygonscanAPIKey = process.env.POLYGONSCAN_API_KEY;

export const scanAccount = async (account: string): Promise<Array<any>> => {
    const normalRes = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=0&endblock=999999999&page=1&offset=1000&sort=asc&apikey=${etherscanAPIKey}`);
    const internalRes = await fetch(`https://api.etherscan.io/api?module=account&action=txlistinternal&address=${account}&startblock=0&endblock=999999999&page=1&offset=1000&sort=asc&apikey=${etherscanAPIKey}`);
    const normalTxList = (await normalRes.json() as any).result;
    const internalTxList = (await internalRes.json() as any).result;
    return normalTxList.concat(internalTxList);
}

export const sortActivities = async (account: string, txList: Array<any>) => {
    const freqMap = new Map<string, number>();
    txList.map((tx) => {
        account = account.toLowerCase();
        const interactiveAddress = account === tx.from ? tx.to : tx.from;
        if (freqMap.has(interactiveAddress)) {
            const currFreq = freqMap.get(interactiveAddress);
            freqMap.set(interactiveAddress, currFreq?currFreq+1:1);
        } else {
            freqMap.set(interactiveAddress, 1);
        }
    });
    return new Map([...freqMap.entries()].sort((a,b) => b[1] - a[1]));
}

const main = async () => {
    const lensUsers = readFileSync('./lens-users.txt').toString().split('\n').slice(150, 200);
    console.log("User count:", lensUsers.length);
    for (const user of lensUsers) {
        const txList = await scanAccount(user);
        const rank = await sortActivities(user, txList);
        console.log("user activity count:", rank.size);
        const rankJson = Object.fromEntries(rank);
        const uploadParams = {
            Bucket: '3card-on-chain-activities',
            Key: user,
            Body: JSON.stringify(rankJson)
        }
        const uploadPromise = S3.upload(uploadParams).promise();
        uploadPromise.then(function (data) {
            console.log('Upload succeed', data.Location);
        }).catch(function (err) {
            console.log("Upload error", err);
        });
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});