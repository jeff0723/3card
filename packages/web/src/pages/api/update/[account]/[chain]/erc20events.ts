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
  res: NextApiResponse
) {
  if (
    typeof req.query.account !== 'string' || 
    typeof req.query.chain !== 'string' ||
    !utils.isAddress(req.query.account) ||
    !scanAPIKeyMap.has(req.query.chain)
  ) {
    res.status(500).json({
      account: req.query.account,
      chain: req.query.chain,
      message: "invalid account or unsupported chain",
    });
  } else {
    const account = req.query.account.toLowerCase();
    const chain = req.query.chain;
    const apiKey = scanAPIKeyMap.get(chain);
    const queryURL = `https://api.${chain}scan.io/api?module=account&action=tokentx&page=1&offset=10000&sort=asc&apikey=${apiKey}&address=${account}&startblock=0`;
    const scanResponse = await fetch(queryURL);
    if (!scanResponse.ok) {
      res.status(500).json({
        account: req.query.account,
        chain: req.query.chain,
        message: `${chain}scan error: ${scanResponse.status}`,
      });
    } else {
      const erc20events = (await scanResponse.json()).result;
      res.status(200).json({
        account,
        chain,
        erc20events,
      });
      const erc20Upload = {
        Bucket: '3card',
        Key: `onchain/${account}/${chain}/erc20events`,
        Body: JSON.stringify(erc20events),
      };
      S3.upload(erc20Upload).promise();
    }
  }
}
