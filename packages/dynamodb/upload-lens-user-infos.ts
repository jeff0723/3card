import { docClient, TABLE_NAME } from './aws-db';
import { readFileSync } from 'fs';
import fetch from 'node-fetch';
require('dotenv').config();

const apiKey = process.env.ETHERSCAN_API_KEY;
const endBlock = 15375870;
const txScanURL = `https://api.etherscan.io/api?module=account&action=txlist&page=1&offset=10000&sort=asc&startblock=0&endblock=${endBlock}&apikey=${apiKey}`;
const nextDrawDate = new Date().toLocaleDateString();

async function main() {
    // console.log(apiKey);
    const users = readFileSync('lens-users-mumbai.txt').toString().split('\n').slice(0, 3000);
    console.log("user count:", users.length, '\n');
    for (const [idx, user] of users.entries()) {
        const res = await fetch(txScanURL + '&address=' + user);
        if (!res.ok) continue;
        const frequencyMap = new Map<string, number>();
        const json = await res.json()
        const txlist = json.result
        if(typeof txlist == 'string') {
            continue;
        }
        console.log(`#${idx} ${user}`);
        txlist.map((tx: any) => {
            if (tx.to === tx.from) return;
            const address = tx.to === user ? tx.from : tx.to;
            const cumu = (frequencyMap.get(address) ?? 0) + 1;
            frequencyMap.set(address, cumu);
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