// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { S3, BUCKET_NAME } from 'aws';
import {
  scanAPIKeyMap,
  ScanERC721Result,
  ScanError,
  ERROR_MESSAGE,
} from 'scan-helper';
import { utils } from 'ethers';
import { NEXT_API_KEY } from 'constants/constants';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScanERC721Result | ScanError>,
) {
  const { account, chain, apikey } = req.query;
  if (apikey !== NEXT_API_KEY) {
    res.status(500).json({
      account,
      message: ERROR_MESSAGE.INVALID_API_KEY,
    } as ScanError);
    return;
  }
  if (
    typeof account !== 'string' || 
    !utils.isAddress(account)
  ) {
    res.status(500).json({
      account,
      message: ERROR_MESSAGE.INVALID_ADDRESS,
    } as ScanError);
    return;
  }
  if (
    typeof chain !== 'string' ||
    !scanAPIKeyMap.has(chain)
  ) {
    res.status(500).json({
      chain,
      message: ERROR_MESSAGE.UNSPORTTED_CHAIN,
    } as ScanError);
    return;
  }
  try {
    const s3data = await S3.getObject({
      Bucket: BUCKET_NAME,
      Key: `onchain/${account.toLowerCase()}/${chain}/erc721`,
    }).promise();
    const scanResult: ScanERC721Result = s3data.Body? JSON.parse(s3data.Body.toString()):{
      account,
      chain,
      erc721events: [],
      erc721assets: [],
    }; 
    res.status(200).json(scanResult);
  } catch (err: any) {
    res.status(500).json({
      account,
      chain,
      message: ERROR_MESSAGE.AWS_QUERY_ERROR,
      details: err.message,
    } as ScanError);
  }
}
