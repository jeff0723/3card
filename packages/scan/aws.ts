import AWS from 'aws-sdk'
require('dotenv').config()

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
export const S3 = new AWS.S3();
