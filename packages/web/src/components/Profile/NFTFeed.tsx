import React, { useState } from "react";
import { chain } from "wagmi";
import { Nft, PaginatedResultInfo, Profile } from "generated/types";
import { useQuery } from "@apollo/client";
import { PROFILE_NFT_FEED_QUERY } from "graphql/query/profile-nft-feed";
import { IS_MAINNET } from "constants/constants";
import NFTsLoading from "./NFTsLoading";
import NFT from "./NFT";
import InfiniteScroll from "react-infinite-scroll-component";

interface Props {
    profile: Profile;
}
const NFTFeed = ({ profile }: Props) => {
    const [nfts, setNfts] = useState<Nft[]>([]);
    const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>();
    const { data, loading, error, fetchMore } = useQuery(PROFILE_NFT_FEED_QUERY, {
        variables: {
            request: {
                //this should change afterward
                chainIds: IS_MAINNET
                    ? [chain.mainnet.id, chain.polygon.id]
                    : [chain.polygonMumbai.id, chain.kovan.id],
                ownerAddress: profile?.ownedBy,
                limit: 10,
            },
        },
        skip: !profile?.ownedBy,
        onCompleted(data) {
            setPageInfo(data?.nfts?.pageInfo);
            setNfts(data?.nfts?.items);
            console.log("[Query]", `Fetched first 10 nfts Profile:${profile?.id}`);
        },
        onError(error) {
            console.error("[Query NFT Error]", error);
        },
    });
    const fetchMoreData = async () => {
        fetchMore({
            variables: {
                request: {
                    chainIds: IS_MAINNET
                        ? [chain.mainnet.id, chain.polygon.id]
                        : [chain.polygonMumbai.id, chain.kovan.id],
                    ownerAddress: profile?.ownedBy,
                    cursor: pageInfo?.next,
                    limit: 10,
                },
            },
        })
            .then(({ data }) => {
                console.log("[Query Result]: ", data);
                setPageInfo(data?.nfts?.pageInfo);
                setNfts([...nfts, ...data?.nfts?.items]);
            })
            .catch((err) => {
                console.log("[Query Fetch More Error]", err);
            });
    };
    return (
        <div>
            {loading && <NFTsLoading />}

            <InfiniteScroll
                dataLength={nfts.length}
                next={fetchMoreData}
                loader={<div>loading</div>}
                hasMore={
                    pageInfo?.next &&
                    pageInfo?.totalCount &&
                    nfts.length !== pageInfo?.totalCount
                }
                endMessage={<h4>Nothing more to show</h4>}
                scrollableTarget="scrollableDiv"
            >
                <div className="grid grid-cols-2 gap-4">
                    {nfts.map((nft, index) => (
                        <NFT nft={nft} key={index} />
                    ))}
                </div>
            </InfiniteScroll>
        </div>
    );
};

export default NFTFeed;
