import { docClient, TABLE_NAME } from './aws-db';

async function main() {
    const params = {
        TableName: TABLE_NAME,
        ProjectionExpression: "account, ranking",
        ExpressionAttributeValues: {
            ":s": 168,
            ":e": 218,
        },
        FilterExpression: "accountIndex >= :s AND accountIndex < :e",
    };
    docClient.scan(params).promise()
    .then(data => console.log(data))
    .catch(err => console.log(err));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});