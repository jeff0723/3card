import { docClient, TABLE_NAME, s3, BUCKET_NAME } from './aws-db';
import { readFileSync } from 'fs';
import fetch from 'node-fetch';
require('dotenv').config();

const apiKey = process.env.ETHERSCAN_API_KEY;
const endBlock = 15389930;
const txScanURL = `https://api.etherscan.io/api?module=account&action=txlist&page=1&offset=10000&sort=asc&startblock=0&endblock=${endBlock}&apikey=${apiKey}`;
const erc20ScanURL = `https://api.etherscan.io/api?module=account&action=tokentx&page=1&offset=10000&sort=asc&startblock=0&endblock=${endBlock}&apikey=${apiKey}`;
const nextDrawDate = new Date().toLocaleDateString();

const startIndex = 9000;
const endIndex = 12000;

async function main() {
    // console.log(apiKey);
    const users = readFileSync('lens-users-mumbai.txt').toString().split('\n').slice(startIndex, endIndex);
    console.log("user count:", users.length, '\n');
    for (const [idx, user] of users.entries()) {

        const erc20res = await fetch(erc20ScanURL + '&address=' + user);
        if (!erc20res.ok) continue;
        const erc20events = (await erc20res.json()).result as any[];
        const erc20eventList = erc20events.filter(event => event.contractAddress !== '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
        console.log(`erc20event size:`, erc20eventList.length);
        const erc20Payload = {
            Bucket: BUCKET_NAME,
            Key: `onchain/${user}/ether/erc20`,
            Body: JSON.stringify(erc20eventList),
        };
        s3.upload(erc20Payload).promise()
        .then(function (data) {
            console.log('Txlist upload S3 success', data.Location);
        })
        .catch(function (err) {
            console.log("Txlist upload S3 error", err);
        });

        const res = await fetch(txScanURL + '&address=' + user);
        if (!res.ok) continue;
        const frequencyMap = new Map<string, number>();
        const txlist = (await res.json()).result;
        if(typeof txlist == 'string') {
            continue;
        }
        console.log(`#${startIndex+idx} ${user}`);
        txlist.map((tx: any) => {
            if (tx.to === tx.from) return;
            const address = tx.to === user ? tx.from : tx.to;
            const cumu = (frequencyMap.get(address) ?? 0) + 1;
            frequencyMap.set(address, cumu);
        });

        console.log(`txlist size:`, frequencyMap.size);
        const txlistPayload = {
            Bucket: BUCKET_NAME,
            Key: `onchain/${user}/ether/ranking`,
            Body: JSON.stringify(txlist),
        };
        s3.upload(txlistPayload).promise()
        .then(function (data) {
            console.log('Txlist upload S3 success', data.Location);
        })
        .catch(function (err) {
            console.log("Txlist upload S3 error", err);
        });

        console.log(`ranking size:`, frequencyMap.size);
        const frequencyPairs = [...frequencyMap.entries()].sort((a,b) => b[1] - a[1]);
        const freqList = frequencyPairs.map((pair) => {
            return {
                address: pair[0],
                frequency: pair[1].toString(),
            }
        });
        const rankingParams = {
            TableName: TABLE_NAME,
            Item: {
                account: user,
                accountIndex: idx,
                latestBlock: endBlock,
                ranking: freqList,
                rankingCount: freqList.length,
                latestRecUser: '',
                nextDrawDate: nextDrawDate,
            },
        };
        docClient.put(rankingParams).promise()
        .then(() => console.log('Ranking upload DynamoDB success'))
        .catch(err => console.log("Ranking upload DynamoDB error", err));
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});