import RssFeeds from 'components/RssFeeds'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { getFeed } from 'lib/rss'
import { FeedType } from 'xml'
import Link from 'next/link'
import styled from 'styled-components'
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from 'react'
interface Feed {
  [key: string]: string
  pubDate: string
  title: string
  isoDate: string
  link: string
  thumbnail: string
  creator: string
}

interface Props {
  feeds?: Feed[]

}
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  gap: 20px;
`
const Title = styled.h1`
  font-weight: 700;
  font-size: 34px;
  line-height: 41px;
`
const Subtitle = styled.h2`
  font-weight: 600;
  font-size: 20px;
  line-height: 24px;
`
const FeedContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 12px 12px;
  gap: 20px;
  border-bottom: 1px solid #2F3336;
  border-radius: 4px;
  &:hover {
    border: 1px solid rgba(0, 148, 255, 1);;
  }
`
const FeedImage = styled.div<{ image: string }>`
  min-width: 130px;
  height: 78px;
  background: url(${({ image }) => image});
  border-radius: 4px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`
const StyledImage = styled(Image)`
  border-radius: 4px;
`
const FeedContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 463px;
  height: 99px;
`
const FeedSubtitle = styled.div`
  display: flex;
  gap:10px
`
const FeedTitle = styled.div`
  font-weight: 700;
  font-size: 16px;
  line-height: 19px;
`
const FeedDate = styled.div`
  font-weight: 400;
  font-size: 13px;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.5);
`
const FeedText = styled.div`
  font-weight: 400;
  font-size: 13px;
  line-height: 16px;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 463px;
  height: 64px;
`

const BlueText = styled.span`
  color: #1890FF
`
const BATCHSIZE = 30

const formatText = (text: string) => {
  if (!text) return <></>
  return <FeedText>{text.slice(0, 200)}... <BlueText>Read More</BlueText></FeedText>
}
const Home: NextPage<Props> = ({ feeds }) => {
  const [items, setItems] = useState<Feed[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [feedLength, setFeedLength] = useState(0)
  const [itemLength, setItemLength] = useState(0)

  useEffect(() => {
    setItems(feeds?.slice(0, BATCHSIZE) || [])
    setFeedLength(feeds?.length || 0)
    setItemLength(BATCHSIZE || 0)
  }, [])
  const fetchMoreData = () => {
    if (itemLength + BATCHSIZE >= feedLength) {
      setHasMore(false)
    }
    setItemLength(items.length + BATCHSIZE)
    setItems([...items, ...feeds?.slice(items.length, items.length + BATCHSIZE) || []])
  }

  return (
    <Container>
      <div>
        <Title>Feeds</Title>
        <Subtitle>Things keep you ahead in web3</Subtitle>
      </div>
      <InfiniteScroll
        dataLength={items.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<div>loading</div>}
        endMessage={<h4>Nothing more to show</h4>}
      >
        {
          items?.map((item) => (
            <a href={item.link} target="_blank" >
              <FeedContainer>
                <FeedImage image={item.thumbnail} />
                <FeedContent>
                  <FeedTitle>{item.title}</FeedTitle>
                  <FeedSubtitle>  <BlueText>{item.creator} </BlueText> <FeedDate>{new Date(item.pubDate).toDateString()}</FeedDate></FeedSubtitle>

                  <FeedText>{formatText(item['content:encodedSnippet'])}</FeedText>
                </FeedContent>
              </FeedContainer>
            </a>
          ))
        }
      </InfiniteScroll>
      {/* {FeedList.map((url) => (
        <div>
          <Link href={`/${url}`}>
            {url}
          </Link>
        </div>
      ))}
      <div>
        <Link href={`/feeds`}>
          08- ALL
        </Link>
      </div> */}
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const filename = new Date().toISOString().slice(0, 10) + '-aws-cron.json'
  const response = await fetch(`https://3card.s3.ap-south-1.amazonaws.com/news-feed/${filename}`)
  const data = await response.json()
  return {
    props: {
      feeds: data
      // images: image,
    },
  }
}

export default Home


