import AWS from 'aws-sdk';
require('dotenv').config()

// console.log(process.env.AWS_ACCESS_KEY_ID)
// console.log(process.env.AWS_SECRET_ACCESS_KEY)

AWS.config.update({
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


export const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

export const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

export const TABLE_NAME = 'lens-rec-table';

export const s3 = new AWS.S3();

export const BUCKET_NAME = '3card';

