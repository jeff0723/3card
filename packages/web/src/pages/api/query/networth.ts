// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { utils } from 'ethers';
import {
  ERROR_MESSAGE,
  ScanError,
  ERC20Asset,
  priceToUsdByTokenAddress,
  provider
} from 'scan-helper';
import { S3, BUCKET_NAME } from 'aws';
import { NEXT_API_KEY } from 'constants/constants';

type NetworthResult = {
  account: string,
  networth: number,
}

const WETH_ADDR = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const ETH_DECIMALS = 18;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse< NetworthResult | ScanError>
) {
    const { account, apikey } = req.query;
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
    const erc20Assets: ERC20Asset[] = await S3.getObject({
        Bucket: BUCKET_NAME,
        Key: `onchain/${account.toLowerCase()}/ether/erc20`,
    }).promise()
    .then(s3data => {
        const scanResult = s3data.Body? JSON.parse(s3data.Body.toString()): [];
        return scanResult.erc20assets?? scanResult;
    })
    .catch(err => {
        return [];
    });
    
    const ethBalance = parseFloat(utils.formatUnits(await provider.getBalance(account), ETH_DECIMALS));
    const tokenAddressList = erc20Assets.map(asset => asset.contractAddress);
    const balanceList = erc20Assets.map(asset => parseFloat(asset.balance));
    tokenAddressList.push(WETH_ADDR);
    balanceList.push(ethBalance);
    const result: any = await priceToUsdByTokenAddress(tokenAddressList);
    const priceMap = result.data;
    const worthList = tokenAddressList.map((addr, idx) => {
        if (priceMap[addr]) {
            return priceMap[addr]['usd'] * balanceList[idx];
        } else {
            return 0;
        }
    });

    const networth = worthList.reduce((p, c) => p + c, 0);
    if (networth) {
      res.status(200).json({
          account,
          networth
      } as NetworthResult);
    } else {
      res.status(200).json({
        account,
        networth: 0,
    } as NetworthResult);
  }
}
