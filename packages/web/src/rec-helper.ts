import { Frequency } from "scan-helper";
import AWS from 'aws-sdk';

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

export const TABLE_SIZE = 3000;

export type RecResult = {
    account: string,
    ranking: Frequency[],
};

export type CheckResult = {
    account: string,
    ifDrawable: boolean,
    ranking: Frequency[],
    lastestRec?: RecResult,
};

export const getCorrelation = (
    ranking1: Frequency[],
    ranking2: Frequency[])
    : number => {
    const map1 = new Map<string, number>(ranking1.map(fre => [fre.address, fre.frequency]));
    const map2 = new Map<string, number>(ranking2.map(fre => [fre.address, fre.frequency]));
    const multiList = [...map1.entries()].map(([addr, freq]) => freq * (map2.get(addr)??0));
    const multiSum = multiList.reduce((p, c) => p + c, 0);
    return multiSum;
};