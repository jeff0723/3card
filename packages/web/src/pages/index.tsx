import Home from 'components/Home'
import { API_URL } from 'constants/constants'
import type { GetServerSideProps, NextPage } from 'next'

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
const HomePage: NextPage<Props> = ({ feeds }) => {

  return (
    <Home feeds={feeds} />
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const metadata = await fetch(`https://3card.s3.ap-south-1.amazonaws.com/news-feed/metadata.json`)
  const { lastUpdated } = await metadata.json()
  const response = await fetch(`https://3card.s3.ap-south-1.amazonaws.com/news-feed/${lastUpdated}`)
  const data = await response.json()
  return {
    props: {
      feeds: data
      // images: image,
    },
  }
}

export default HomePage


