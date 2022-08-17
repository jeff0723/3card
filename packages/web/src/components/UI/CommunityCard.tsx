import { Publication } from 'generated/types'
import Link from 'next/link'
import { FC } from 'react'

type CardProps = {
    community: Publication
}
const CommunityCard: FC<CardProps> = ({ community }) => (
    <Link href={`/community/${community?.id}`}>
        <div className='flex max-w-[275px] gap-2 py-2 px-4 rounded-lg border border-border-gray'>
            <div className='flex items-center'>
                <img src={community?.metadata?.cover?.original?.url} className='rounded-lg' width={80} height={80} />
            </div>
            <div className='flex flex-col'>
                <div className='font-bold'>{community?.metadata?.name}</div>
                <div className='text-gray-400'>{community?.metadata?.description}</div>
                <div className='flex gap-2 text-gray-500'>
                    <div>{community?.stats?.totalAmountOfComments} posts</div>
                    <div>{community?.stats?.totalAmountOfCollects} members</div>
                </div>
            </div>
        </div>
    </Link>
)
export default CommunityCard