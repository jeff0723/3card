// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
type Data = {
    name: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {

    const metadata = await fetch(`https://3card.s3.ap-south-1.amazonaws.com/news-feed/metadata.json`,)
    const { lastUpdated } = await metadata.json()
    const response = await fetch(`https://3card.s3.ap-south-1.amazonaws.com/news-feed/${lastUpdated}`)
    const data = await response.json()
    res.status(200).json(data);
}
