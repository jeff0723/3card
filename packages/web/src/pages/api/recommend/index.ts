// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { utils } from 'ethers';
import {
  ScanError,
  ERROR_MESSAGE,
} from 'scan-helper';
import { RecResult, getCorrelation, TABLE_NAME, docClient } from 'rec-helper';

const TABLE_SIZE = 3000;
const SCAN_RANGE = 100;
const RANDOM_NUMBER_RANGE = TABLE_SIZE - SCAN_RANGE;
const ONE_DAY_INTERVAL = 86400000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RecResult | ScanError>
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
  } else {
    const accLower = account.toLowerCase();

    const ddbGet: any = {
      TableName: TABLE_NAME,
      Key: {
          account: accLower,
      }
    };
    const data = await docClient.get(ddbGet).promise();
    const userInfo = data.Item;
    if (!userInfo) {
      res.status(500).json({
        account,
        message: ERROR_MESSAGE.AWS_QUERY_ERROR,
      } as ScanError);
      return;    
    }

    const currentTimestamp = Date.now();
    if (currentTimestamp <= new Date(userInfo.nextDrawDate).valueOf() || test) {
        res.status(500).json({
            account,
            message: "not yet draw time",
          } as ScanError);
        return;
    }

    const randomNum = Math.floor(Math.random() * RANDOM_NUMBER_RANGE);
    const ddbScan: any = {
      TableName: TABLE_NAME,
      ProjectionExpression: "account, ranking",
      ExpressionAttributeValues: {
          ":l": randomNum,
          ":u": randomNum + SCAN_RANGE,
      },
      FilterExpression: "accountIndex >= :l AND accountIndex <= :u",
    };
    const othersData = await docClient.scan(ddbScan).promise();
    const othersInfos = othersData.Items as any[];
    const otherCount = othersData.Count;
    if (otherCount === 0) {
      res.status(200).json({
        account: '',
        ranking: [],
      } as RecResult);
    } else {
      const corrList = othersInfos.map(
        info => getCorrelation(userInfo.ranking, info.ranking)
      );
      const maxCorrelation = Math.max(...corrList);
      const peerIndex = corrList.indexOf(maxCorrelation);
      const peerUser = othersInfos[peerIndex] as RecResult;
      const nextDrawDate = new Date(currentTimestamp + ONE_DAY_INTERVAL).toLocaleDateString();
      const latestRecUser = peerUser.account;
      const latestRecRanking = peerUser.ranking;
      const ddbUpdate: any = {
        TableName: TABLE_NAME,
        Key: {
          account: accLower,
        },
        UpdateExpression: 'set latestRecUser = :u, latestRecRanking = :r, nextDrawDate = :t',
        ExpressionAttributeValues: {
          ':u' : latestRecUser,
          ':r' : latestRecRanking,
          ':t' : nextDrawDate,
        }
      };
      try {
        await docClient.update(ddbUpdate).promise();
        res.status(200).json(peerUser);
      } catch (err) {
        res.status(500).json({
          account,
          message: ERROR_MESSAGE.AWS_UPLOAD_ERROR,
          details: err,
        } as ScanError)
      }
    }
  };
}
