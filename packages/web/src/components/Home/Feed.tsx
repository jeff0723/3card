import React from 'react'
import styled from 'styled-components'

interface Item {
    [key: string]: string
    pubDate: string
    title: string
    isoDate: string
    link: string
    thumbnail: string
    creator: string
}
interface Props {
    item: Item
}
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
const FeedText = styled.p`
  font-weight: 400;
  font-size: 13px;
  text-overflow: ellipsis;
  width: 100%;
  height: 64px;
  overflow: hidden;
`

const BlueText = styled.span`
  color: #1890FF
`


const Feed = ({ item }: Props) => {
    return (
        <a href={item.link} target="_blank" >

            <FeedContainer>
                <FeedImage image={item.thumbnail} />
                <FeedContent>
                    <FeedTitle>{item.title}</FeedTitle>
                    <FeedSubtitle>  <BlueText>{item.creator} </BlueText> <FeedDate>{new Date(item.pubDate).toDateString()}</FeedDate></FeedSubtitle>

                    <FeedText>{item['content:encodedSnippet']}</FeedText>
                </FeedContent>
            </FeedContainer>
        </a>
    )
}

export default Feed