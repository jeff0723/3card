import { BigNumber } from "ethers";
import { readFileSync } from "fs";

const startIndex = 0;
const endIndex = 10000;

const folder = 1_000_000_000_000;
const divident = Math.floor(folder/100);

async function main() {
    const users = readFileSync('lens-users-mumbai.txt').toString().split('\n').slice(startIndex, endIndex);    
    const freqMap = new Map<number, number>();
    users.map(user => {
        // console.log(BigNumber.from(user).mod(folder).div(divident).toNumber());
        const num = BigNumber.from(user).mod(folder).div(divident).toNumber();
        freqMap.set(num, (freqMap.get(num)??0) + 1);
    })
    console.log(freqMap);
    console.log(freqMap.size);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});