// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { S3 } from 'aws';
import { scanAPIKeyMap } from 'scan';
import { utils } from 'ethers';

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
      Key: `onchain/${account.toLowerCase()}/${chain}/erc20events`,
    }, (err, out) => {
      if (err === null) {
        const erc20events = out.Body ? JSON.parse(out.Body.toString()) : [];
        res.status(200).json({
          account,
          chain,
          erc20events,
        });
      } else {
        res.status(500).json({
          account,
          chain,
          message: "key not exists",
        });
      }
    });
  }
}
