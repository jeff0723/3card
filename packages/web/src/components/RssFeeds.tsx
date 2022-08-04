import React from 'react'

import { getFeed } from 'lib/rss'
import { GetStaticProps } from 'next'
import { InferGetStaticPropsType } from 'next'

const RssFeeds = ({ items }: InferGetStaticPropsType<typeof getStaticProps>) => {
  console.log('Items', items)
  return (
    <div>RssFeeds</div>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const feed = await getFeed("https://blog.0xproject.com/feed")
  console.log(feed)
  return {
    props: {
      items: feed.items,
    },
    revalidate: 1,
  };
}

export default RssFeeds