// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  S3,
  scanAPIKeyMap,
  ERC20Event,
  ERC20Asset,
  ScanERC20Result,
  ScanError,
  ERROR_MESSAGE,
  BUCKET_NAME
} from 'scan-helper';
import { utils, BigNumber } from 'ethers';

type TokenInfo = {
  tokenName: string,
  tokenSymbol: string,
  balance: BigNumber,
  decimal: string,
};

const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScanERC20Result | ScanError>,
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
    const queryURL = `https://api.${chain}scan.${dns}/api?module=account&action=tokentx&page=1&offset=10000&sort=asc&apikey=${apiKey}&address=${account}&startblock=0`;
    const scanResponse = await fetch(queryURL);
    if (!scanResponse.ok) {
      res.status(500).json({
        account,
        chain,
        message: ERROR_MESSAGE.SCAN_QUERY_ERROR,
        details: (await scanResponse.json()).message
      } as ScanError);
    } else {
      const erc20events: ERC20Event[] = (await scanResponse.json()).result;
      const erc20assetsMap = new Map<string, TokenInfo>();
      erc20events.map(event => {
        const tokenInfo = erc20assetsMap.get(event.contractAddress);
        if (event.to === event.from) return;
        const op = event.to === account.toLowerCase()? 'add': 'sub';
        erc20assetsMap.set(event.contractAddress, tokenInfo?{
          ...tokenInfo,
          balance: tokenInfo.balance[op](event.value),
        }:{
          tokenName: event.tokenName,
          tokenSymbol: event.tokenSymbol,
          balance: BigNumber.from(0)[op](event.value),
          decimal: event.tokenDecimal,
        })
      });
      erc20assetsMap.delete(WETH_ADDRESS);
      const erc20assets: ERC20Asset[] = [...erc20assetsMap.entries()]
        .map(info => {
          return {
            contractAddress: info[0],
            tokenName: info[1].tokenName,
            tokenSymbol: info[1].tokenSymbol,
            balance: utils.formatUnits(info[1].balance, info[1].decimal),
          };
      });
      const scanResult: ScanERC20Result = {
        account,
        chain,
        erc20events,
        erc20assets,
        endblock: 0,
      };
      const erc20Payload = {
        Bucket: BUCKET_NAME,
        Key: `onchain/${account.toLowerCase()}/${chain}/erc20`,
        Body: JSON.stringify(scanResult),
      };
      try {
        const s3info = await S3.upload(erc20Payload).promise();
        res.status(200).json({
          ...scanResult,
          awsinfo: `upload to ${s3info.Location}`,
        } as ScanERC20Result);
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
