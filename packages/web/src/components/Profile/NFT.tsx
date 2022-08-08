import { Card } from 'components/UI/Card'
import { CHAIN_TO_NAME, OPENSEA_URL } from 'constants/constants'
import { Nft } from 'generated/types'

type Props = {
    nft: Nft
}


const NFT = ({ nft }: Props) => {
    const nftURL = `${OPENSEA_URL}/assets/${CHAIN_TO_NAME[nft.chainId]}/${nft.contractAddress}/${nft.tokenId}`.toLowerCase()
    return (
        <Card>
            <a href={nftURL} target="_blank" rel="noreferrer noopener">
                <div className="space-y-4 h-60 rounded-t-[10px]">
                    {nft.originalContent?.animatedUrl ?
                        (
                            <iframe
                                title={`${nft.contractAddress}:${nft.tokenId}`}
                                sandbox=""
                                className="w-full h-full sm:rounded-t-[10px]"
                                src={nft?.originalContent?.animatedUrl}
                            />
                        )
                        : (
                            <div className="space-y-4 h-60 rounded-t-[10px]"
                                style={{
                                    backgroundImage: `url(${nft.originalContent.uri
                                        })`,
                                    backgroundSize: 'contain',
                                    backgroundPosition: 'center center',
                                    backgroundRepeat: 'no-repeat'
                                }}>
                            </div>)
                    }
                </div>
                <div className="p-5 space-y-2 border-t hover:border-t hover:bg-white hover:bg-opacity-20">
                    <div>
                        {nft?.collectionName}
                    </div>
                    <div >
                        {nft?.name}

                    </div>
                </div>
            </a>
        </Card >
    )
}

export default NFT