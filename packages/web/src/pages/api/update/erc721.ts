// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { S3, BUCKET_NAME } from 'aws';
import {
  scanAPIKeyMap,
  ERC721Event,
  ERC721Asset,
  ScanERC721Result,
  ScanError,
  ERROR_MESSAGE,
} from 'scan-helper';
import { utils } from 'ethers';

type TokenInfo = {
  tokenName: string,
  tokenSymbol: string,
  tokenIdList: Set<string>,
};

export default async function handler(
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
    const apiKey = scanAPIKeyMap.get(chain);
    const dns = chain === 'ether'?'io':'com';
    const queryURL = `https://api.${chain}scan.${dns}/api?module=account&action=tokennfttx&page=1&offset=10000&sort=asc&apikey=${apiKey}&address=${account}&startblock=0`;
    const scanResponse = await fetch(queryURL);
    if (!scanResponse.ok) {
      res.status(500).json({
        account,
        chain,
        message: ERROR_MESSAGE.SCAN_QUERY_ERROR,
        details: (await scanResponse.json()).message,
      } as ScanError);
    } else {
      const erc721events: ERC721Event[] = (await scanResponse.json()).result;
      const erc721assetsMap = new Map<string, TokenInfo>();
      erc721events.map(event => {
        const tokenInfo = erc721assetsMap.get(event.contractAddress);
        if (event.to === event.from) return;
        if (tokenInfo) {
          const tokenIdList = tokenInfo.tokenIdList;
          if (event.to === account.toLowerCase()) {
            tokenIdList.add(event.tokenID);
          } else {
            tokenIdList.delete(event.tokenID);
          }
          erc721assetsMap.set(event.contractAddress, {
            ...tokenInfo,
            tokenIdList,
          });
        } else {
          erc721assetsMap.set(event.contractAddress, {
            tokenName: event.tokenName,
            tokenSymbol: event.tokenSymbol,
            tokenIdList: new Set<string>([event.tokenID]),
          });
        }
      });
      const erc721assets: ERC721Asset[] = [...erc721assetsMap.entries()]
      .filter(info => info[1].tokenIdList.size > 0)
      .map(info => {
        return {
          contractAddress: info[0],
          tokenName: info[1].tokenName,
          tokenSymbol: info[1].tokenSymbol,
          tokenIdList: [...info[1].tokenIdList.keys()],
        }
      });
      const scanResult: ScanERC721Result = {
        account,
        chain,
        erc721events,
        erc721assets,
        endblock: 0,
      };
      const erc721Payload = {
        Bucket: BUCKET_NAME,
        Key: `onchain/${account.toLowerCase()}/${chain}/erc721`,
        Body: JSON.stringify(scanResult),
      };
      try {
        const s3info = await S3.upload(erc721Payload).promise();
        res.status(200).json({
          ...scanResult,
          awsinfo: `upload to ${s3info.Location}`,
        } as ScanERC721Result);
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
