import { Spinner } from "components/UI/Spinner";
import { Fragment, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAppSelector } from "state/hooks";
import styled from "styled-components";
import CreateProfileHelper from "./CreateProfileHelper";
import Feed from "./Feed";
import RecommendUser from "./RecommendUser";
import { HiPlus } from 'react-icons/hi'
import Modal from "components/UI/Modal";
import { FiX } from "react-icons/fi";
import { HiPencilAlt, HiUserGroup } from 'react-icons/hi'
import CreatePost from "./CreatePost";
import { Dialog, Transition } from "@headlessui/react";
import { Domain } from "domain";
import CreateButton from "./CreateButton";
import Search from "./Search";
import type { GetServerSideProps, NextPage } from 'next'
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
  feeds?: Item[];
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
  gap: 10px;
  padding: 12px;
`;
const Title = styled.div`
  font-weight: 700;
  font-size: 34px;
  line-height: 41px;
`;
const Subtitle = styled.div`
  font-weight: 600;
  font-size: 20px;
  line-height: 24px;
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

const BATCHSIZE = 30;

const Home: NextPage<Props> = (props: Props) => {
  const [items, setItems] = useState<Item[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [feeds, setFeeds] = useState<Item[]>([]);
  const [feedLength, setFeedLength] = useState(0);
  const [itemLength, setItemLength] = useState(0);
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)
  const currentUser = useAppSelector(state => state.user.currentUser)
  const [optionShow, setOptionShow] = useState(false)
  useEffect(() => {
    if (feeds.length) {
      setItems(feeds?.slice(0, BATCHSIZE) || []);
      setFeedLength(feeds?.length || 0);
      setItemLength(BATCHSIZE || 0);
    }

  }, [feeds]);
  const fetchFeed = async () => {
    setLoading(true)
    const res = await fetch('http://localhost:3000/api/get-today-news').finally(() => setLoading(false))
    setFeeds(await res.json() as Item[])
  }
  useEffect(() => {
    fetchFeed()
  }, [])
  const fetchMoreData = () => {
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
  if (loading) {
    return <div className="mx-auto">
      <Spinner size="lg" />
    </div>
  }
  return (
    <>
      <div style={{ display: "flex", width: "100%", position: 'relative' }}>
        <Content >
          {isAuthenticated && currentUser &&
            <CreateButton />
          }

          <Header>
            <Title>Feeds</Title>
            <Subtitle>Things keep you ahead in web3</Subtitle>
          </Header>
          <div className="overflow-y-auto" id='scrollableDiv'>
            <InfiniteScroll
              dataLength={items.length}
              next={fetchMoreData}
              hasMore={hasMore}
              loader={<div className="flex justify-center"><Spinner size="md" /></div>}
              endMessage={<h4>Nothing more to show</h4>}
              scrollableTarget="scrollableDiv"
            >
              {items?.map((item, index) => (
                <Feed key={index} item={item} />
              ))}
            </InfiniteScroll>
          </div>
        </Content>
        <FunctionContainer>
          <Search />
          <FilterContainer>
            <div>Filter</div>
            {["Today", "Project Update", "Research", "Newsletter"].map(
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
          </FilterContainer>
        </FunctionContainer>
      </div>
    </>
  );
};

export default Home;
