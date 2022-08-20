import { docClient, TABLE_NAME } from './aws-db';

async function main() {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            account: '0x2276de711b7e822af65b50ff214d2ce1d36154ca',
        },
        UpdateExpression: 'set latestRecUser = :u, latestRecRanking = :r',
        ExpressionAttributeValues: {
          ':u' : '0x6e732a286e5f4014c214d1c60d0a86b474c16f9f',
          ':r' : [{address: '0x6e732a286e5f4014c214d1c60d0a86b474c16f9f', frequency: 2}],
        }
    };
    docClient.update(params).promise()
    .then(data => console.log(data))
    .catch(err => console.log(err));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});