// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  S3,
  scanAPIKeyMap,
  ScanRankingResult,
  ScanError,
  ERROR_MESSAGE,
  BUCKET_NAME
} from 'scan-helper';
import { utils } from 'ethers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScanRankingResult | ScanError>,
) {
  const { account, chain } = req.query;
  if (
    typeof account !== 'string' || 
    !utils.isAddress(account)
  ) {
    res.status(500).json({
      account,
      message: ERROR_MESSAGE.INVALID_ADDRESS,
    } as ScanError);
  } else if (
    typeof chain !== 'string' ||
    !scanAPIKeyMap.has(chain)
  ) {
    res.status(500).json({
      chain,
      message: ERROR_MESSAGE.UNSPORTTED_CHAIN,
    } as ScanError);
  } else {
    try {
      const s3data = await S3.getObject({
        Bucket: BUCKET_NAME,
        Key: `onchain/${account.toLowerCase()}/${chain}/ranking`,
      }).promise();
      const scanResult: ScanRankingResult = s3data.Body? JSON.parse(s3data.Body.toString()):[]; 
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
}
