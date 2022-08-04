import { getFeed } from 'lib/rss'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import Parser from 'rss-parser'
import { ParsedUrlQuery } from 'querystring'
import { NextPageContext } from 'next';


interface Props {
    items?: Parser.Item[]
    feeds: Parser.Output<{
        [key: string]: any;
    }>
    slug: string
    url: string
}
interface IParams extends ParsedUrlQuery {
    slug: string,
    url: string
}
const CalculateDaysDiff = (date: string) => {
    const now = new Date()
    const postDate = new Date(date)
    const diff = Math.abs(now.getTime() - postDate.getTime())
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24))
    return diffDays
}
const Feed = ({ items, slug, url }: Props) => {
    return (
        <div>
            {items?.map((item) => (
                <a href={item.link} key={item.link} rel="noopener noreferrer" target="_blank">
                    <div key={item.title}>
                        <h1>{item.title}</h1>

                        <p>{
                            //@ts-ignore
                            CalculateDaysDiff(item.pubDate)
                        } days ago</p>
                        <div dangerouslySetInnerHTML={{ __html: item.content ? item.content : "" }}></div>
                    </div>
                </a>
            ))}
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { params, query } = context;

    const feeds = await getFeed(query?.url as string)
    // const image = feeds.image?.url
    const items: Parser.Item[] = feeds.items
    return {
        props: {
            items: items,
            // images: image,
            slug: params?.slug,
            url: query?.url,
            feeds: feeds
        },
    }
}
export default Feed