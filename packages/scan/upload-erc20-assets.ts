import { scanner } from './scanner';
import { readFileSync } from 'fs';
import { S3 } from './aws';

async function main() {
    // target info
    const accounts = readFileSync('lens-users-mumbai.txt').toString().split('\n').slice(50, 3000);
    const startBlock = 0;

    for (const [idx,account] of accounts.entries()) {
        // fetch erc20 events and upload S3
        console.log(`#${idx} ${account}`);
        scanner.target(account);
        const erc20Events = await scanner.fetchERC20EventList('ethereum', startBlock);
        console.log("erc20 event count:", erc20Events.length);
        const scanResult = await scanner.getERC20Assets(erc20Events);
        const erc20EventPayload = {
            Bucket: '3card',
            Key: `onchain/${scanner.account}/ether/erc20`,
            Body: JSON.stringify(scanResult),
        };
        S3.upload(erc20EventPayload).promise()
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