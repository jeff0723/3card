import * as dotenv from 'dotenv';
import { Scanner } from './scanner';
import { S3 } from './aws';

dotenv.config();

async function main() {
    // target info
    const chain = 'bsc';
    const account = '0x6c77a5a88c0ae712baeabe12fea81532060dcbf5';
    const startBlock = 0;
    
    // construct scanner
    const scanner = new Scanner(
        process.env.ETHERSCAN_API_KEY,
        process.env.POLYGONSCAN_API_KEY,
        process.env.BSCSCAN_API_KEY,
    );

    // config scanner
    scanner.config(chain, account, startBlock);

    // fetch tx list
    if (await scanner.fetchTxList()) {
        console.log("tx count:", scanner.txList.length);
        const frequencyMap = await scanner.getFrequency();
        console.log("frequency map count:", frequencyMap.size);
        const uploadParams = {
            Bucket: '3card',
            Key: `onchain/${scanner.account}/${scanner.chain}/ranking`,
            Body: JSON.stringify(Object.fromEntries(frequencyMap)),
        };
        const uploadPromise = S3.upload(uploadParams).promise();
        uploadPromise.then(function (data) {
            console.log('Upload succeed', data.Location);
        }).catch(function (err) {
            console.log("Upload error", err);
        });
    }

    // fetch erc20 event
    if (await scanner.fetchERC20EventList()) {
        console.log("erc20 event count:", scanner.erc20EventList.length);
        const uploadParams = {
            Bucket: '3card',
            Key: `onchain/${scanner.account}/${scanner.chain}/erc20events`,
            Body: JSON.stringify(Object.fromEntries(scanner.erc20EventList)),
        };
        const uploadPromise = S3.upload(uploadParams).promise();
        uploadPromise.then(function (data) {
            console.log('Upload succeed', data.Location);
        }).catch(function (err) {
            console.log("Upload error", err);
        });
    }
    
    // fetch erc721 event
    if (await scanner.fetchERC721EventList()) {
        console.log("erc721 event count:", scanner.erc721EventList.length);
        const uploadParams = {
            Bucket: '3card',
            Key: `onchain/${scanner.account}/${scanner.chain}/erc721events`,
            Body: JSON.stringify(Object.fromEntries(scanner.erc721EventList)),
        };
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