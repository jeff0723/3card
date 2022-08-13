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
    S3.getObject({
      Bucket: '3card',
      Key: `onchain/${account.toLowerCase()}/${chain}/erc721events`,
    }, (err, out) => {
      if (err === null) {
        const erc721events = out.Body? JSON.parse(out.Body.toString()):[];
        res.status(200).json({
          account,
          chain,
          erc721events,
        });
      } else {
        res.status(500).json({
          account,
          chain,
          message: "key not exists",
      });
    }});
  }
}
