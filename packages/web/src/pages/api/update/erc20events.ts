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
    const apiKey = scanAPIKeyMap.get(chain);
    const queryURL = `https://api.${chain}scan.io/api?module=account&action=tokentx&page=1&offset=10000&sort=asc&apikey=${apiKey}&address=${account}&startblock=0`;
    const scanResponse = await fetch(queryURL);
    if (!scanResponse.ok) {
      res.status(500).json({
        account,
        chain,
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
        Key: `onchain/${account.toLowerCase()}/${chain}/erc20events`,
        Body: JSON.stringify(erc20events),
      };
      S3.upload(erc20Upload).promise();
    }
  }
}
