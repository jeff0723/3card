import { docClient, TABLE_NAME } from './aws-db';

async function main() {
    const params = {
        TableName: TABLE_NAME,
        // ProjectionExpression: "account, latestRecUser, nextDrawDate",
        Key: {
            account: '0x2276de711b7e822af65b50ff214d2ce1d36154ca',
        }
    };
    docClient.get(params).promise()
    .then(data => console.log(data))
    .catch(err => console.log(err));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});