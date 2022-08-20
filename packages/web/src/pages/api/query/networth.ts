// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { utils } from 'ethers';
import { S3, ERROR_MESSAGE, BUCKET_NAME, ScanError, ERC20Asset, priceToUsdByTokenAddress, provider } from 'scan-helper';


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
    const { account } = req.query;
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
    const ethBalance = utils.formatUnits(await provider.getBalance(account), ETH_DECIMALS);
    const tokenAddressList = erc20Assets.map(asset => asset.contractAddress);
    const balanceList = [...erc20Assets.map(asset => asset.balance), ethBalance];
    const result: any = await priceToUsdByTokenAddress([...tokenAddressList, WETH_ADDR]);
    const priceMap = result.data;
    const worthList = tokenAddressList.map((addr, idx) => {
        if (priceMap[addr]) {
            parseInt(balanceList[idx]);
            return priceMap[addr]['usd'] * parseInt(balanceList[idx]);
        } else {
            return 0;
        }
    });

    const networth = worthList.reduce(
        (previousValue, currentValue) => previousValue + currentValue, 0,
    );

    res.status(200).json({
        account,
        networth
    } as NetworthResult);
}
