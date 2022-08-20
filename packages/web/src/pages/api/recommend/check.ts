// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { utils } from 'ethers';
import {
  ScanError,
  ERROR_MESSAGE,
} from 'scan-helper';
import { CheckResult, docClient, TABLE_NAME } from 'rec-helper';

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
    const ddbGet: any = {
      TableName: TABLE_NAME,
      ProjectionExpression: "account, latestRecUser, latestRecRanking, nextDrawDate",
      Key: {
          account: account.toLowerCase(),
      }
    };
    const data = await docClient.get(ddbGet).promise();
    if (data.Item) {
      const ifDrawable = Date.now() > (new Date(data.Item.nextDrawDate)).valueOf();
      res.status(200).json({
        account,
        ifDrawable, 
        lastestRec: { 
          account: data.Item.latestRecUser,
          ranking: data.Item.latestRecRanking,
        }
      } as CheckResult);
    } else {
      res.status(500).json({
        account,
        message: ERROR_MESSAGE.AWS_QUERY_ERROR,
      } as ScanError);        
    }
  }
}
