import PostBody from 'components/Profile/PostBody'
import PostHeader from 'components/Profile/PostHeader'
import { MediaSet, NftImage, Profile, Publication } from 'generated/types'
import Link from 'next/link'
import { HiOutlineSwitchHorizontal } from "react-icons/hi"
type Props = {
    post: Publication
}

const SingleThread = ({ post }: Props) => {
    return (
        <div className='flex flex-col border-b border-border-gray pt-4'>
            {post?.__typename === "Mirror" &&
                <div className='flex items-center pb-4 gap-2 text-gray-400 font-bold'>
                    <HiOutlineSwitchHorizontal />
                    <div> {post?.profile?.name} mirrored {post.mirrorOf?.profile?.name}&apos;s post</div>
                </div>}
            {post?.__typename === "Comment" &&
                //@ts-ignore
                <Link href={`/post/${post?.commentOn?.pubId}`}>
                    <div className='flex gap-[10px]'>
                        <PostHeader profile={post?.commentOn?.profile as Profile & { picture: MediaSet & NftImage }} comment />
                        <PostBody post={post?.commentOn as Publication} />
                    </div>
                </Link>
            }
            <Link href={post?.__typename === "Mirror" ? `/post/${post?.mirrorOf?.id}` : `/post/${post?.id}`}>
                <div className='flex gap-[10px]'>
                    {post?.__typename !== "Mirror" && <PostHeader profile={post?.profile as Profile & { picture: MediaSet & NftImage }} />}
                    {post?.__typename === "Mirror" && <PostHeader profile={post?.mirrorOf.profile as Profile & { picture: MediaSet & NftImage }} />}
                    <PostBody post={post} mirror={post?.__typename === "Mirror"} />
                </div>
            </Link>
        </div>
    )
}

export default SingleThread