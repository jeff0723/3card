import { Spinner } from "components/UI/Spinner";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAppSelector } from "state/hooks";
import styled from "styled-components";
import Feed from "./Feed";
import Search from "./Search";

type Props = {
    height: string;
}

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

const BATCHSIZE = 30;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
const Title = styled.div`
  font-weight: 700;
  font-size: 20px;
`;

const FunctionContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 16px;
  gap: 10px;
  width: 100%;
`;


const NewsFeed = ({ height }: Props) => {
    const feeds = useAppSelector((state) => state.application.news);
    const [items, setItems] = useState<Item[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [itemLength, setItemLength] = useState(0);
    const [feedLength, setFeedLength] = useState(0);

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
    }
    return (
        <div className="flex flex-col gap-[10px] w-full">

            <Header>
                <Title>News</Title>
            </Header>

            <div className="overflow-y-auto no-scrollbar" id='scrollableDiv2' style={{
                height: height,
            }}>
                <InfiniteScroll
                    dataLength={items.length}
                    next={fetchMoreNews}
                    hasMore={hasMore}
                    loader={<div className="flex justify-center"><Spinner size="md" /></div>}
                    endMessage={<h4>Nothing more to show</h4>}
                    scrollableTarget="scrollableDiv2"
                >
                    {items?.map((item, index) => (
                        <Feed key={index} item={item} />
                    ))}
                </InfiniteScroll>

            </div>
        </div>
    )
}

export default NewsFeed;