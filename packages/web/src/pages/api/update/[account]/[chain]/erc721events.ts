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
    const queryURL = `https://api.${chain}scan.io/api?module=account&action=tokennfttx&page=1&offset=10000&sort=asc&apikey=${apiKey}&address=${account}&startblock=0`;
    const scanResponse = await fetch(queryURL);
    if (!scanResponse.ok) {
      res.status(500).json({
        account,
        chain,
        message: `${chain}scan error: ${scanResponse.status}`,
      });
    } else {
      const erc721events = (await scanResponse.json()).result;
      res.status(200).json({
        account,
        chain,
        erc721events,
      });
      const erc721Upload = {
        Bucket: '3card',
        Key: `onchain/${account.toLowerCase()}/${chain}/erc721events`,
        Body: JSON.stringify(erc721events),
      };
      S3.upload(erc721Upload).promise();
    }
  }
}
