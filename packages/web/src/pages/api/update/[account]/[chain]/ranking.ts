// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';
import { utils } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

const scanAPIKeyMap = new Map<string, string | undefined>([
  ['ether', process.env.etherscanAPIKey],
  ['polygon', process.env.polygonscanAPIKey],
  ['bsc', process.env.bscscanAPIKey],
]);

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const S3 = new AWS.S3();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { account, chain } = req.query;
  if (
    typeof account !== 'string' || 
    !utils.isAddress(account)
  ) {
    res.status(500).json({
      account,
      message: "invalid account",
    });
  } else if (
    typeof chain !== 'string' ||
    !scanAPIKeyMap.has(chain)
  ) {
    res.status(500).json({
      chain,
      message: "unsupported chain",
    });
  } else {
    const apiKey = scanAPIKeyMap.get(chain);
    const queryURL = `https://api.${chain}scan.com/api?module=account&action=txlist&page=1&offset=10000&sort=asc&apikey=${apiKey}&address=${account}&startblock=0`;
    const scanResponse = await fetch(queryURL);
    if (!scanResponse.ok) {
      res.status(500).json({
        account,
        chain,
        message: `${chain}scan error: ${scanResponse.status}`,
      });
    } else {
      const txlist = (await scanResponse.json()).result;
      const frequencyMap = new Map<string, number>();
      txlist.map((tx: any) => {
          const interactiveAddress = account === tx.from ? tx.to : tx.from;
          if (frequencyMap.has(interactiveAddress)) {
              const currFreq = frequencyMap.get(interactiveAddress);
              frequencyMap.set(interactiveAddress, currFreq?currFreq+1:1);
          } else {
              frequencyMap.set(interactiveAddress, 1);
          }
      });
      const frequencyPairs = [...frequencyMap.entries()].sort((a,b) => b[1] - a[1]);
      const ranking = frequencyPairs.map(pair => ({
        contractAddress: pair[0],
        frequency: pair[1],
      }));
      res.status(200).json({
        account,
        chain,
        txlist,
        ranking,
      });
      const txListPayload = {
        Bucket: '3card',
        Key: `onchain/${account}/${chain}/txlist`,
        Body: JSON.stringify(txlist),
      };
      S3.upload(txListPayload).promise();
      const rankingPayload = {
        Bucket: '3card',
        Key: `onchain/${account}/${chain}/ranking`,
        Body: JSON.stringify(ranking),
      };
      S3.upload(rankingPayload).promise();
    }
  }
}
