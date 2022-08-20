import { useQuery } from "@apollo/client";
import Tippy from '@tippyjs/react';
import Modal from 'components/UI/Modal';
import { Spinner } from "components/UI/Spinner";
import { IS_MAINNET } from "constants/constants";
import { Nft, PaginatedResultInfo } from "generated/types";
import { PROFILE_NFT_FEED_QUERY } from "graphql/query/profile-nft-feed";
import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useAppSelector } from "state/hooks";
import 'tippy.js/dist/tippy.css';
import getIPFSLink from "utils/getIPFSLink";
import { chain } from "wagmi";

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    setSelectedNFT: (nft: Nft) => void;
}
export const trimAddress = (address: string) => {
    if (address.length > 10) {
        return address.slice(0, 10) + "..." + address.slice(address.length - 10)
    }
    return address
}
const SelectNFT = ({ open, setOpen, setSelectedNFT }: Props) => {
    const currentUser = useAppSelector(state => state.user.currentUser);
    const [nfts, setNfts] = useState<Nft[]>([]);
    const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>();
    const [loadMoreLoading, setLoadmoreLoading] = useState(false);
    const { data, loading, error, fetchMore } = useQuery(PROFILE_NFT_FEED_QUERY, {
        variables: {
            request: {
                //this should change afterward
                chainIds: IS_MAINNET
                    ? [chain.mainnet.id, chain.polygon.id]
                    : [chain.polygonMumbai.id, chain.kovan.id],
                ownerAddress: currentUser?.ownedBy,
            },
        },
        skip: !currentUser?.ownedBy,
        onCompleted(data) {
            setPageInfo(data?.nfts?.pageInfo);
            setNfts(data?.nfts?.items);
            console.log("[Query]", `Fetched first 10 nfts Profile:${currentUser?.id}`);
        },
        onError(error) {
            console.error("[Query NFT Error]", error);
        },
    });
    const fetchMoreData = async () => {
        setLoadmoreLoading(true);
        fetchMore({
            variables: {
                request: {
                    chainIds: IS_MAINNET
                        ? [chain.mainnet.id, chain.polygon.id]
                        : [chain.polygonMumbai.id, chain.kovan.id],
                    ownerAddress: currentUser?.ownedBy,
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
            })
            .finally(() => setLoadmoreLoading(false));
    };

    return (
        <Modal open={open} onClose={() => { setOpen(false) }} size='lg'>
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <div className="text-[20px] font-bold">
                        MY NFT
                    </div>
                    <div onClick={() => { setOpen(false) }} className='inline-flex justify-center items-center w-8 h-8 rounded-full hover:bg-primary-blue hover:bg-opacity-30 hover:text-sky-400' >
                        <FiX className="text-[20px] " />
                    </div>
                </div>
                <div className='flex flex-wrap gap-4'>

                    {nfts.map((nft, index) => (
                        <Tippy key={index} content={
                            <div className="flex flex-col">
                                <div>
                                    Contract address: {trimAddress(nft?.contractAddress)}
                                </div><div>
                                    Token ID: {nft?.tokenId}
                                </div>
                                <div>
                                    Name: {nft?.name}
                                </div>
                            </div>} placement='bottom'>

                            <div className='w-[100px] h-[100px] hover:w-[110px] hover:h-[110px] hover:cursor-pointer'
                                key={index}
                                onClick={() => {
                                    setSelectedNFT(nft)
                                    setOpen(false)
                                }}>
                                <div
                                    className="w-full h-full rounded-lg"
                                    style={{
                                        backgroundImage: `url(${getIPFSLink(nft.originalContent.uri)})`,
                                        backgroundSize: "contain",
                                        backgroundPosition: "center center",
                                        backgroundRepeat: "no-repeat",
                                    }} />
                            </div>
                        </Tippy>
                    ))}
                </div>
                {loadMoreLoading &&
                    <div className="mx-auto">
                        <Spinner size='md' />
                    </div>}
                {
                    !loadMoreLoading &&
                    pageInfo?.next &&
                    pageInfo?.totalCount &&
                    nfts.length !== pageInfo?.totalCount
                    &&
                    <button onClick={fetchMoreData}>
                        Show more
                    </button>
                }

            </div>
        </Modal>
    )
}

export default SelectNFT