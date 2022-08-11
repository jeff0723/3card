import { scanner } from './scanner';

async function main() {
    // target info
    const account = '0x98d0EFf29037C2F60054ED9F01f297aDb1875732';
    const chain = 'ethereum';
    const startBlock = 0;

    scanner.target(account);
    console.log(await scanner.fetchNormalTxList(chain, startBlock));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});