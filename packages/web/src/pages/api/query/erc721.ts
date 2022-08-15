// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  S3,
  scanAPIKeyMap,
  ScanERC721Result,
  ScanError,
  ERROR_MESSAGE
} from 'scan-helper';
import { utils } from 'ethers';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScanERC721Result | ScanError>,
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
    S3.getObject({
      Bucket: '3card',
      Key: `onchain/${account.toLowerCase()}/${chain}/erc721`,
    }, (err, out) => {
      if (err === null) {
        const scanResult: ScanERC721Result = out.Body? JSON.parse(out.Body.toString()):[];
        res.status(200).json(scanResult);
      } else {
        res.status(500).json({
          account,
          chain,
          message: ERROR_MESSAGE.AWS_QUERY_ERROR,
          details: err.message,
        } as ScanError);
    }});
  }
}
