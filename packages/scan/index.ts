import * as dotenv from 'dotenv';
import { scanner } from './scanner';
import { S3 } from './aws';

dotenv.config();

async function main() {
    // target info
    const account = '0x4a1a2197f307222cd67a1762d9a352f64558d9be';
    const chain = 'bsc';
    const startBlock = 0;

    // target account
    scanner.target(account);
    if (!scanner.check(chain, startBlock)) return

    // fetch tx list, get ranking and upload S3
    const txList = await scanner.fetchTxList(chain, startBlock);
    console.log("tx count:", txList.length);
    const ranking = await scanner.getRanking(txList);
    console.log("ranking count:", ranking.size);
    const rankingPayload = {
        Bucket: '3card',
        Key: `onchain/${scanner.account}/${chain}/ranking`,
        Body: JSON.stringify(Object.fromEntries(ranking)),
    };
    S3.upload(rankingPayload).promise()
    .then(function (data) {
        console.log('Upload succeed', data.Location);
    })
    .catch(function (err) {
        console.log("Upload error", err);
    });
    
    // fetch erc20 events and upload S3
    const erc20Events = await scanner.fetchERC20EventList(chain, startBlock);
    console.log("erc20 event count:", erc20Events.length);
    const erc20EventPayload = {
        Bucket: '3card',
        Key: `onchain/${scanner.account}/${chain}/erc20events`,
        Body: JSON.stringify(erc20Events),
    };
    S3.upload(erc20EventPayload).promise()
    .then(function (data) {
        console.log('Upload succeed', data.Location);
    })
    .catch(function (err) {
        console.log("Upload error", err);
    });
    
    // fetch erc721 events
    const erc721Events = await scanner.fetchERC721EventList(chain, startBlock);
    console.log("erc721 event count:", erc721Events.length);
    const erc721EventPayload = {
        Bucket: '3card',
        Key: `onchain/${scanner.account}/${chain}/erc721events`,
        Body: JSON.stringify(erc721Events),
    };
    S3.upload(erc721EventPayload).promise()
    .then(function (data) {
        console.log('Upload succeed', data.Location);
    })
    .catch(function (err) {
        console.log("Upload error", err);
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});