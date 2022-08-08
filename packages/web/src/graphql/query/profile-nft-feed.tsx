import { gql } from "@apollo/client"

export const PROFILE_NFT_FEED_QUERY = gql`
  query ProfileNFTFeed($request: NFTsRequest!) {
    nfts(request: $request) {
      items {
        name
        collectionName
        contractAddress
        tokenId
        chainId
        originalContent {
          uri
          animatedUrl
        }
      }
      pageInfo {
        next
        totalCount
      }
    }
  }
`