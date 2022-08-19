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
import { RecMetadata, RecResult, getCorrelation } from 'rec-helper';

const INTERVAL = 86400000;

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
    const acc = account.toLowerCase();
    const initMetadata: RecMetadata = {
        nextDrawDate: new Date().toLocaleDateString(),
        alreadyRecTo: [],
    };
    const metadata = await S3.getObject({
        Bucket: BUCKET_NAME,
        Key: `rec/${acc}-metadata`
    }).promise()
    .then((data) => data.Body? JSON.parse(data.Body.toString()) as RecMetadata : initMetadata)
    .catch(() => initMetadata);

    const currentTimestamp = Date.now();
    if (!test) {
      if (Date.now() <= new Date(metadata.nextDrawDate).valueOf()) {
          res.status(500).json({
              account,
              message: "not yet draw time",
            } as ScanError);
          return;
      } else {
          metadata.nextDrawDate = new Date(currentTimestamp + INTERVAL).toLocaleDateString()
      }
    }

    const alreadyRecSet = new Set(metadata.alreadyRecTo); 

    const accRanking = await S3.getObject({
        Bucket: BUCKET_NAME,
        Key: `rec/${acc}`,
      }).promise()
      .then(data => {
        return data.Body? JSON.parse(data.Body.toString()):[] as Frequency[];
      })
      .catch(async () => {
        res.status(500).json({
            account,
            message: "no register",
          } as ScanError);
        return undefined;
      });
      if (accRanking) {
        const otherObjects = await S3.listObjects({
            Bucket: BUCKET_NAME,
            Prefix: 'rec',
            MaxKeys: 20,
          }).promise()
          .then(data => data)
          .catch(() => {
            res.status(500).json({
                account,
                message: "fetch others data error",
              } as ScanError);
            return undefined;
          });
          let maxCorrelation = 0;
          let maxAccount: string = '';
          let maxRanking: Frequency[] = [];
          if (otherObjects && otherObjects.Contents) {
            for (const c of otherObjects.Contents) {
                if (!c.Key) continue;
                const other = c.Key.split('/')[1];
                if (acc === other || (alreadyRecSet.has(other) && !test )) continue;
                const data = await S3.getObject({
                    Bucket: BUCKET_NAME,
                    Key: c.Key
                }).promise();
                if (!data.Body) continue;
                const ranking = JSON.parse(data.Body.toString()) as Frequency[];
                if (getCorrelation(accRanking, ranking) > maxCorrelation) {
                    maxAccount = other;
                    maxRanking = ranking;
                }
            }
            metadata.alreadyRecTo.push(maxAccount);
            await S3.upload({
                Bucket: BUCKET_NAME,
                Key: `rec/${acc}-metadata`,
                Body: JSON.stringify(metadata),
            }).promise();
            res.status(200).json({
                account: maxAccount,
                ranking: maxRanking,
            } as RecResult);
          } else {
            res.status(500).json({
                account,
                message: "no others data",
              } as ScanError);
          }
      }
  }
}
