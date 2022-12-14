import { Profile, MediaSet, NftImage } from 'generated/types'
import { useRouter } from 'next/router'
import React from 'react'
import getIPFSLink from 'utils/getIPFSLink'


interface Props {
    profile: Profile & { picture: MediaSet & NftImage }
    comment?: boolean
}


const PostHeader = ({ profile, comment }: Props) => {
    const router = useRouter()
    return (
        <div className='flex flex-col min-w-fit'>
            {
                profile?.picture?.original?.url || profile?.picture?.uri ? (<img
                    src={getIPFSLink(profile?.picture?.original?.url || profile?.picture?.uri)}
                    className="rounded-full w-10 h-10 hover:cursor-pointer" onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/user/${profile.handle}`)
                    }} />) :
                    (<div className="bg-black rounded-full w-10 h-10 hover:cursor-pointer" onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/user/${profile.handle}`)
                    }} />)
            }

            {comment &&
                <div className='w-full h-full flex justify-center'>
                    <div className='bg-gray-300 border-[0.8px] -my-[4px] border-[#333639]'></div>
                </div>
            }
        </div>
    )
}

export default PostHeader