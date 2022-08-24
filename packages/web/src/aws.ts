import AWS from 'aws-sdk';

AWS.config.update({
    region: 'us-east-1',
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
});

export const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

export const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

export const TABLE_NAME = 'lens-rec-table';

export const TABLE_SIZE = 9000;

export const BUCKET_NAME = '3card';

export const S3 = new AWS.S3();