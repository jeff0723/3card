import React from 'react'
import styled from 'styled-components'
import { GoGlobe } from 'react-icons/go'
interface Item {
  [key: string]: string
  pubDate: string
  title: string
  isoDate: string
  link: string
  thumbnail: string
  creator: string
  favIcon: string
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

  background: url(${({ image }) => image});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`
const FeedContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 463px;

`
const FeedSubtitle = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap:10px
`
const FeedTitle = styled.div`
  font-weight: 700;
  font-size: 16px;
  line-height: 17px;
  width: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  overflow: hidden;
`
const FeedDate = styled.div`
  font-size: 13px;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.5);
`
const FeedText = styled.p`
  font-weight: 400;
  font-size: 13px;
  line-height: 16px;
  text-overflow: ellipsis;
  width: 100%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`

const BlueText = styled.span`
  color: #1890FF
`


const Feed = ({ item }: Props) => {
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" >

      <FeedContainer>
        {!item.thumbnail && !item.favIcon ?
          <GoGlobe className='text-[40px] text-primary-blue' /> : (

            <img src={item.thumbnail || item.favIcon} className='w-10 h-10 rounded-full' alt='thumbnail'
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src = "/logo.png";
              }} />
          )}

        <FeedContent>
          <FeedTitle>{item.title}</FeedTitle>
          <FeedText className='text-gray-400'>{item['content:encodedSnippet']}</FeedText>

          <FeedSubtitle className='font-semi-bold'>  <BlueText>{item.creator} </BlueText> <FeedDate>{new Date(item.pubDate).toDateString()}</FeedDate></FeedSubtitle>

        </FeedContent>
      </FeedContainer>
    </a>
  )
}

export default Feed