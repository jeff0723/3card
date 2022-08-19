import AWS from 'aws-sdk'
require('dotenv').config()

AWS.config.update({
    region: 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

export const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

export const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
