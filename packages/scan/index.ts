import { scanner } from './scanner';
import { S3 } from './aws';

async function main() {
    // target info
    const account = '0xdc3391c6c5f317f46f5ff076acc7e77d291854e3';
    const chains = ['ethereum', 'polygon', 'bsc'];
    const startBlock = 0;

    // target account
    for (const chain of chains) {
        scanner.target(account);
        console.log("chain:", chain);
        console.log("start block:", startBlock);
        if (!scanner.check(chain, startBlock)) return
    
        // fetch tx list, get ranking and upload S3
        const txList = await scanner.fetchNormalTxList(chain, startBlock);
        console.log("tx count:", txList.length);
        const ranking = await scanner.getFrequencyRanking(txList);
        console.log("ranking count:", ranking.length);
        const rankingPayload = {
            Bucket: '3card',
            Key: `onchain/${scanner.account}/${chain}/ranking`,
            Body: JSON.stringify(ranking),
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
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});