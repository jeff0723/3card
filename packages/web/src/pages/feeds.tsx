import RssFeeds from 'components/RssFeeds'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { getFeed } from 'lib/rss'
import { GetStaticProps, GetServerSideProps } from 'next'
import Parser from 'rss-parser'
import Link from 'next/link'
import { rss } from 'xml'

interface Props {
    items?: Parser.Item[]

}
const CalculateDaysDiff = (date: string) => {
    const now = new Date()
    const postDate = new Date(date)
    const diff = Math.abs(now.getTime() - postDate.getTime())
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24))
    return diffDays
}
const Feeds: NextPage<Props> = ({ items }) => {
    // console.log({ feeds })
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
    const items: Parser.Item[] = []


    for (let i = 0; i < 20; i++) {
        const feed = await getFeed(rss[i])
        items.push(...feed.items)
    }
    return {
        props: {
            items: items,
        },
    }
}
export default Feeds


