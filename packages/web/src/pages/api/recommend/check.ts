// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { utils } from 'ethers';
import {
  provider,
  scanAPIKeyMap,
  Frequency,
  ScanError,
  NormalTx,
  ERROR_MESSAGE,
} from 'scan-helper';
import { CheckResult } from 'rec-helper';
import { docClient, TABLE_NAME } from 'aws';
import { NEXT_API_KEY } from 'constants/constants';

const TABLE_SIZE = 3000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckResult | ScanError>
) {
  const { account, apikey } = req.query;
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
  const ddbGet: any = {
    TableName: TABLE_NAME,
    ProjectionExpression: "account, latestRecUser, latestRecRanking, nextDrawDate, ranking",
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
      ranking: data.Item.ranking,
      lastestRec: { 
        account: data.Item.latestRecUser,
        ranking: data.Item.latestRecRanking,
      }
    } as CheckResult);
  } else {
    const latestBlock = await provider.getBlockNumber();
    const queryURL = `https://api.etherscan.io/api?module=account&action=txlist&page=1&offset=10000&sort=asc&apikey=${scanAPIKeyMap.get('ether')}&address=${account}&startblock=0`;
    const scanResponse = await fetch(queryURL);
    if (!scanResponse.ok) {
      res.status(500).json({
        account,
        message: ERROR_MESSAGE.SCAN_QUERY_ERROR,
      } as ScanError);
      return;
    }
    const result = (await scanResponse.json()).result;
    if (typeof result === 'string') {
      res.status(500).json({
        account,
        message: ERROR_MESSAGE.SCAN_QUERY_ERROR,
      } as ScanError);
      return;
    }
    const txList = result as NormalTx[];
    const frequencyMap = new Map<string, number>();
    const accLower = account.toLowerCase();

    await Promise.all(txList.map(async tx => {
        if (tx.to === tx.from) return;
        const address = tx.to === accLower ? tx.from : tx.to;
        const cumu = (frequencyMap.get(address) ?? 0) + 1;
        frequencyMap.set(address, cumu);
    }));
    const frequencyPairs = [...frequencyMap.entries()].sort((a,b) => b[1] - a[1]);
    const ranking: Frequency[] = await Promise.all(frequencyPairs.map(async pair => ({
      address: pair[0],
      frequency: pair[1],
    })));
    const nextDrawDate = new Date().toLocaleDateString();
    const ddbParams: any = {
      TableName: TABLE_NAME,
      Item: {
          account: accLower,
          accountIndex: Math.round(Math.random() * TABLE_SIZE),
          latestBlock,
          ranking,
          rankingCount: ranking.length,
          latestRecUser: '',
          nextDrawDate,
      },
    }
    try {
      await docClient.put(ddbParams).promise();
      res.status(200).json({
        account,
        ifDrawable: true,
      } as CheckResult);
    } catch (err) {
      res.status(500).json({
        account,
        message: ERROR_MESSAGE.AWS_UPLOAD_ERROR,
        details: err
      } as ScanError);
    }
  }
}