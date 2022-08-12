import { Scanner } from './scanner';
import { readFileSync, writeFileSync } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    const users = readFileSync('lens-users-mumbai.txt').toString().split('\n');
    const chain = 'ethereum';
    const totalFrequencyMap = new Map<string, number>();

    // construct scanner
    const scanner = new Scanner(
        process.env.ETHERSCAN_API_KEY,
        process.env.POLYGONSCAN_API_KEY,
        process.env.BSCSCAN_API_KEY,
    );
    for (const user of users.slice(10500,11000)) {
        scanner.target(user);
        const txList = await scanner.fetchNormalTxList(chain, 0);
        console.log(user, ':', txList.length);
        txList.map((tx) => {
            const interactiveAddress = scanner.account === tx.from ? tx.to : tx.from;
            if (totalFrequencyMap.has(interactiveAddress)) {
                const currFreq = totalFrequencyMap.get(interactiveAddress);
                totalFrequencyMap.set(interactiveAddress, currFreq+1);
            } else {
                totalFrequencyMap.set(interactiveAddress, 1);
            }
        });
    }
    const totalRanking = new Map([...totalFrequencyMap.entries()].sort((a,b) => b[1] - a[1]));
    writeFileSync(`./totalRanking-${chain}.json`, JSON.stringify(Object.fromEntries(totalRanking), null, 4));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});