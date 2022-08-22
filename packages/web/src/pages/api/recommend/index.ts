// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { utils } from 'ethers';
import {
  ScanError,
  ERROR_MESSAGE,
} from 'scan-helper';
import { RecResult, getCorrelation } from 'rec-helper';
import { TABLE_NAME, docClient } from 'aws';
import { NEXT_API_KEY } from 'constants/constants';

const TABLE_SIZE = 3000;
const SCAN_RANGE = 30;
const RANDOM_NUMBER_RANGE = TABLE_SIZE - SCAN_RANGE;
const ONE_DAY_INTERVAL = 86400000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RecResult | ScanError>
) {
  const { account, test, apikey } = req.query;
  // if (apikey !== NEXT_API_KEY) {
  //   res.status(500).json({
  //     account,
  //     message: ERROR_MESSAGE.INVALID_API_KEY,
  //   } as ScanError);
  //   return;    
  // }
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
      account: '0xa77d84dd50ac12a5c98846e673b29c5ddb079f50',
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
}