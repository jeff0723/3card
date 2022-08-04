import RssFeeds from 'components/RssFeeds'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { getFeed } from 'lib/rss'
import { GetStaticProps } from 'next'
import Parser from 'rss-parser'
import Link from 'next/link'

interface Props {
    items?: Parser.Item[]
    feeds: Parser.Output<{
        [key: string]: any;
    }>
}
const CalculateDaysDiff = (date: string) => {
    const now = new Date()
    const postDate = new Date(date)
    const diff = Math.abs(now.getTime() - postDate.getTime())
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24))
    return diffDays
}
const Feed: NextPage<Props> = ({ items, feeds }) => {
    // console.log({ feeds })
    console.log(process.cwd())
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


export const getStaticProps: GetStaticProps = async (context) => {
    const feeds = await getFeed("https://blog.deribit.com/feed/")
    console.log('feed image:', feeds.image)
    // const image = feeds.image?.url
    const items: Parser.Item[] = feeds.items
    return {
        props: {
            items: items,
            // images: image,
            feeds: feeds
        },
    }
}
export default Feed


