// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { utils } from 'ethers';
import {
  S3,
  scanAPIKeyMap,
  NormalTx,
  Frequency,
  ScanRankingResult,
  ScanError,
  ERROR_MESSAGE,
  BUCKET_NAME
} from 'scan-helper';
import { CheckResult, RecMetadata } from 'rec-helper';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckResult | ScanError>
) {
  const { account } = req.query;
  if (
    typeof account !== 'string' || 
    !utils.isAddress(account)
  ) {
    res.status(500).json({
      account,
      message: ERROR_MESSAGE.INVALID_ADDRESS,
    } as ScanError);
  } else {
    const acc = account.toLowerCase();
    const ranking = await S3.getObject({
        Bucket: BUCKET_NAME,
        Key: `onchain/${acc}/ether/ranking`,
      }).promise()
      .then(data => {
        const scanResult: ScanRankingResult = data.Body? JSON.parse(data.Body.toString()):[];
        return scanResult.ranking;
      })
      .catch(async () => {
        const queryURL = `https://api.etherscan.io/api?module=account&action=txlist&page=1&offset=10000&sort=asc&apikey=${scanAPIKeyMap.get('ether')}&address=${account}&startblock=0`;
        const scanResponse = await fetch(queryURL);
        if (!scanResponse.ok) {
          return undefined;
        } else {
          const rawTxlist: NormalTx[] = (await scanResponse.json()).result;
          const frequencyMap = new Map<string, number>();
          const accLower = account.toLowerCase();
    
          await Promise.all(rawTxlist.map(async tx => {
              const peerAddress = accLower === tx.from ? tx.to : tx.from;
              const currFreq = frequencyMap.get(peerAddress);
              frequencyMap.set(peerAddress, currFreq?currFreq+1:1);
          }));
          const frequencyPairs = [...frequencyMap.entries()].sort((a,b) => b[1] - a[1]);
          const ranking: Frequency[] = await Promise.all(frequencyPairs.map(async pair => ({
            address: pair[0],
            frequency: pair[1],
          })));

          return ranking;
      }});
      if (ranking) {
        try {
          const rankingInfo = await S3.upload({
            Bucket: BUCKET_NAME,
            Key: `rec/${acc}`,
            Body: JSON.stringify(ranking),
          }).promise();
          const metadata: RecMetadata = {
            nextDrawDate: new Date().toLocaleDateString(),
            alreadyRecTo: [],
          };
          const metadataInfo = await S3.upload({
            Bucket: BUCKET_NAME,
            Key: `rec/${acc}-metadata`,
            Body: JSON.stringify(metadata),
          }).promise();
          res.status(200).json({
            account,
            ifDrawable: true,
            rankingLoc: rankingInfo.Location,
            metadataLoc: metadataInfo.Location,
          } as CheckResult);
        } catch (err: any) {
          res.status(500).json({
            account,
            message: ERROR_MESSAGE.AWS_UPLOAD_ERROR,
            details: err.message,
          } as ScanError);
        }
      } else {
        res.status(500).json({
          account,
          chain: 'ether',
          message: ERROR_MESSAGE.SCAN_QUERY_ERROR,
        } as ScanError);
      }
  }
}
