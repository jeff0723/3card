// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  S3,
  scanAPIKeyMap,
  NormalTx,
  Frequency,
  ScanRankingResult,
  ScanError,
  ERROR_MESSAGE,
  BUCKET_NAME,
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
    const apiKey = scanAPIKeyMap.get(chain);
    const dns = chain === 'ether'?'io':'com';
    const queryURL = `https://api.${chain}scan.${dns}/api?module=account&action=txlist&page=1&offset=10000&sort=asc&apikey=${apiKey}&address=${account}&startblock=0`;
    const scanResponse = await fetch(queryURL);
    if (!scanResponse.ok) {
      res.status(500).json({
        account,
        chain,
        message: ERROR_MESSAGE.SCAN_QUERY_ERROR,
        details: (await scanResponse.json()).message,
      } as ScanError);
    } else {
      const rawTxlist: NormalTx[] = (await scanResponse.json()).result;
      const frequencyMap = new Map<string, number>();
      const accLower = account.toLowerCase();

      const txlist: NormalTx[] = await Promise.all(rawTxlist.map(async tx => {
          const peerAddress = accLower === tx.from ? tx.to : tx.from;
          const currFreq = frequencyMap.get(peerAddress);
          frequencyMap.set(peerAddress, currFreq?currFreq+1:1);
          return {
            ...tx,
          };
      }));
      const frequencyPairs = [...frequencyMap.entries()].sort((a,b) => b[1] - a[1]);
      const ranking: Frequency[] = await Promise.all(frequencyPairs.map(async pair => ({
        address: pair[0],
        frequency: pair[1],
      })));
      const scanResult: ScanRankingResult = {
        account,
        chain,
        txlist,
        ranking,
        endblock: 0,
      };
      const rankingPayload = {
        Bucket: BUCKET_NAME,
        Key: `onchain/${accLower}/${chain}/ranking`,
        Body: JSON.stringify(scanResult),
      };
      try {
        const s3info = await S3.upload(rankingPayload).promise();
        res.status(200).json({
          ...scanResult,
          awsinfo: `upload to ${s3info.Location}`,
        } as ScanRankingResult);
      } catch (err: any) {
        res.status(500).json({
          account,
          message: ERROR_MESSAGE.AWS_UPLOAD_ERROR,
          details: err.message,
        } as ScanError);
      }
    }
  }
}
