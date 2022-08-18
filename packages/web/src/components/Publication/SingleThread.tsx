import PostBody from 'components/Profile/PostBody'
import PostHeader from 'components/Profile/PostHeader'
import { MediaSet, NftImage, Profile, Publication } from 'generated/types'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { HiOutlineSwitchHorizontal } from "react-icons/hi"
type Props = {
    post: Publication
}

const SingleThread = ({ post }: Props) => {
    const router = useRouter()

    return (
        <div className='flex flex-col border-b border-border-gray pt-4'>
            {post?.__typename === "Mirror" &&
                <div className='flex items-center pb-4 gap-2 text-gray-400 font-bold'>
                    <HiOutlineSwitchHorizontal />
                    <div> {post?.profile?.name} mirrored {post.mirrorOf?.profile?.name}&apos;s post</div>
                </div>}
            {post?.__typename === "Comment" &&
                //@ts-ignore
                <div onClick={() => { router.push(`/post/${post?.commentOn?.pubId}`) }} className='hover:cursor-pointer'>
                    <div className='flex gap-[10px]'>
                        <PostHeader profile={post?.commentOn?.profile as Profile & { picture: MediaSet & NftImage }} comment />
                        <PostBody post={post?.commentOn as Publication} />
                    </div>
                </div>
            }
            <div onClick={
                post?.__typename === "Mirror" ?
                    //@ts-ignore
                    () => { router.push(`/post/${post?.commentOn?.pubId}`) } :
                    () => { router.push(`/post/${post?.id}`) }}
                className='hover:cursor-pointer'>
                <div className='flex gap-[10px]'>
                    {post?.__typename !== "Mirror" && <PostHeader profile={post?.profile as Profile & { picture: MediaSet & NftImage }} />}
                    {post?.__typename === "Mirror" && <PostHeader profile={post?.mirrorOf.profile as Profile & { picture: MediaSet & NftImage }} />}
                    <PostBody post={post} mirror={post?.__typename === "Mirror"} />
                </div>
            </div>
        </div>
    )
}

export default SingleThread