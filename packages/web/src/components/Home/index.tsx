import { useQuery } from "@apollo/client";
import NFTPost from "components/Profile/NFTPost";
import ProfileLoading from "components/Profile/ProfileLoading";
import SingleThread from "components/Publication/SingleThread";
import { Spinner } from "components/UI/Spinner";
import { PaginatedResultInfo, Publication } from "generated/types";
import { HOME_FEED_QUERY } from "graphql/query/home-feed-query";
import type { NextPage } from 'next';
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAppSelector } from "state/hooks";
import styled from "styled-components";
import { useAccount } from "wagmi";
import CreateButton from "./CreateButton";
import ExploreFeed from "./ExploreFeed";
import Feed from "./Feed";
import NewsFeed from "./NewsFeed";
import Search from "./Search";

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

}
const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px 16px;
  flex-shrink: 0;
  border-right: 1px solid #2F3336;
}
`;
const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
const Title = styled.div`
  font-weight: 700;
  font-size: 20px;
`;
const Subtitle = styled.div`
  font-weight: 600;
  font-size: 15px;
`;
const FunctionContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 16px;
  gap: 10px;
  width: 100%;
`;
const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  gap: 10px;
`;
const NewsContainer = styled.div`
  height:65vh;
`
const BATCHSIZE = 30;

const Home: NextPage<Props> = (props: Props) => {
  const feeds = useAppSelector((state) => state.application.news);
  const loadingNews = useAppSelector((state) => state.application.loadingNews);
  const [items, setItems] = useState<Item[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [feedLength, setFeedLength] = useState(0);
  const [itemLength, setItemLength] = useState(0);
  const { address } = useAccount()
  // const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)
  const currentUser = useAppSelector(state => state.user.currentUser)
  const [optionShow, setOptionShow] = useState(false)
  const [publications, setPublications] = useState<Publication[]>()
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const { data, loading: feedLoading, error, fetchMore } = useQuery(HOME_FEED_QUERY, {
    variables: {
      request: { profileId: currentUser?.id },
      reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
      profileId: currentUser?.id ?? null
    },
    skip: !currentUser,
    fetchPolicy: 'no-cache',
    errorPolicy: "all",
    onCompleted(data) {
      setPageInfo(data?.timeline?.pageInfo)
      setPublications(data?.timeline?.items)
      console.log('[Query]', `Fetched first 10 timeline publications`)
      console.log(data)
    },
    onError(error) {

      console.error('[Query Home Feed Error] ', error)
    }
  })
  useEffect(() => {
    if (feeds.length) {
      setItems(feeds?.slice(0, BATCHSIZE) || []);
      setFeedLength(feeds?.length || 0);
      setItemLength(BATCHSIZE || 0);
    }

  }, [feeds]);
  const fetchMoreNews = () => {
    if (!feeds.length) return
    if (itemLength + BATCHSIZE >= feedLength) {
      setHasMore(false);
    }

    setItemLength(items.length + BATCHSIZE);
    setItems([
      ...items,
      ...(feeds?.slice(items.length, items.length + BATCHSIZE) || []),
    ]);

  };

  const fetchMoreFeeds = async () => {

    fetchMore({
      variables: {
        request: {
          profileId: currentUser?.id,
          cursor: pageInfo?.next,
          limit: 10
        },
        reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
        profileId: currentUser?.id ?? null
      }
    }).then(({ data }) => {
      console.log("[Query Result]: ", data)
      setPageInfo(data?.timeline?.pageInfo)
      //@ts-ignore
      setPublications([...publications, ...data?.timeline?.items])
    }).catch(err => {
      console.log('[Query Error]', err)
    })
  }
  return (


    <>
      <div className='grid grid-cols-12 w-full relative h-full'>
        <Content className="col-span-7" >
          {isAuthenticated && currentUser &&
            <CreateButton />
          }
          <Header>
            <Title>Home</Title>
          </Header>
          {
            feedLoading && !publications &&
            <div className="w-full">
              <ProfileLoading />
            </div>
          }
          {
            publications && publications.length > 0 &&

            <div className="overflow-y-auto no-scrollbar h-screen w-full" style={{ height: '85vh' }} id='scrollableDiv'>

              <InfiniteScroll
                dataLength={publications?.length}
                next={fetchMoreFeeds}
                loader={<div className='flex justify-center'><Spinner size='md' /></div>}
                hasMore={pageInfo?.next && pageInfo?.totalCount && publications.length !== pageInfo?.totalCount}
                scrollableTarget="scrollableDiv"
                className='no-scrollbar'
              >
                {publications.map((post, index) => (
                  (
                    post?.metadata?.attributes[0]?.value === 'NFTPost' ?
                      <NFTPost post={post} key={index} />
                      :
                      <SingleThread post={post} key={index} />

                  )
                ))}
              </InfiniteScroll>
            </div>
          }
          {
            (!currentUser || (publications?.length == 0 && !feedLoading)) && <ExploreFeed />
          }

        </Content>
        <FunctionContainer className="col-span-5">
          <Search />
          {/* <FilterContainer>
            <div>Filter</div>
            {["Project Update", "Research", "Newsletter"].map(
              (item, index) => (
                <div className="flex items-center" key={index}>
                  <input
                    checked
                    type="checkbox"
                    value=""
                    className="accent-primary-blue"
                  />
                  <label className="ml-2">{item}</label>
                </div>
              )
            )}
          </FilterContainer> */}
          <NewsFeed height="55vh" />
        </FunctionContainer>
      </div >
    </>
  );
};

export default Home;
