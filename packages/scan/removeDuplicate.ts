import { readFileSync, writeFileSync } from "fs";

async function main() {
    const users = readFileSync('lens-users-polygon.txt').toString().split('\n');
    console.log('before user size:', users.length);
    var seen = {};
    const uniqueUsers = users.filter((user) => {
        return seen.hasOwnProperty(user) ? false : (seen[user] = true);
    });
    console.log('after user size:', uniqueUsers.length);
    writeFileSync(
        'lens-users-mumbai.txt',
        uniqueUsers.join('\n') + '\n'
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});