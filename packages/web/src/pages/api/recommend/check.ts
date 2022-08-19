// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { utils } from 'ethers';
import {
  S3,
  Frequency,
  ScanError,
  ERROR_MESSAGE,
  BUCKET_NAME
} from 'scan-helper';
import { CheckResult, RecMetadata } from 'rec-helper';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckResult | ScanError>
) {
  const { account, test } = req.query;
  if (
    typeof account !== 'string' || 
    !utils.isAddress(account)
  ) {
    res.status(500).json({
      account,
      message: ERROR_MESSAGE.INVALID_ADDRESS,
    } as ScanError);
  } else if (test) {
    res.status(200).json({
      account,
      ifDrawable: true,
    });
  } else {
    try {
        const s3data = await S3.getObject({
          Bucket: BUCKET_NAME,
          Key: `rec/${account.toLowerCase()}-metadata`,
        }).promise();
        const metadata = s3data.Body? JSON.parse(s3data.Body.toString()) as RecMetadata: undefined;
        if (metadata) {
          res.status(200).json({
            account,
            ifDrawable: Date.now() > (new Date(metadata.nextDrawDate)).valueOf(),
          });
        } else {
          res.status(200).json({
            account,
            ifDrawable: false,
          });
        }
      } catch (err: any) {
        res.status(500).json({
          account,
          message: ERROR_MESSAGE.AWS_QUERY_ERROR,
          details: err.message,
        } as ScanError);
      }    
  }
}
