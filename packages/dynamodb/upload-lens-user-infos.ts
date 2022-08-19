import { ddb } from './aws-db';
import { NormalTx, Ranking } from './scan-types';
import { readFileSync } from 'fs';
import fetch from 'node-fetch';

const apiKey = process.env.ETHERSCAN_API_KEY

const etherscanURL = `https://api.etherscan.com/api?module=account&action=txlist&page=1&offset=10000&sort=asc&startblock=0&apikey=${apiKey}`

async function main() {
    const users = readFileSync('lens-users-mumbai.txt').toString().split('\n').slice(0,1);
    console.log("user count:", users.length)
    for (const [idx, user] of users.entries()) {
        const res = await fetch(etherscanURL + '&address=' + user);
        if (!res.ok) continue;
        const rankingMap = new Map<string, number>();
        const txlist = (await res.json()) as NormalTx[];
        txlist.map(tx => {
            if (tx.to === tx.from) return;
            const peerAddress = tx.to === user ? tx.from : tx.to;
            const cumu = (rankingMap.get(peerAddress) ?? 0) + 1;
            rankingMap.set(peerAddress, cumu);
        });
        console.log(`#${idx} ranking size:`, rankingMap.size);
        const ranking: Ranking = {};
        [...rankingMap.entries()].map(pair => {
            // pair[]
        });
        const params = {
            TableName: 'lens-user-infos',
            Item: {
              'address' : {S: user},
              'createAt' : {N: Date.now()},
              'ranking' : {S: 'Richard Roe'}
            }
        };
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});