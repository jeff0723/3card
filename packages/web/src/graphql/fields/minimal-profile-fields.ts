import { gql } from '@apollo/client'

export const MinimalProfileFields = gql`
  fragment MinimalProfileFields on Profile {
    id
    name
    handle
    bio
    ownedBy
    isFollowedByMe
    attributes {
      key
      value
    }
    picture {
      ... on MediaSet {
        original {
          url
        }
      }
      ... on NftImage {
        uri
      }
    }
    followModule {
      __typename
    }
    coverPicture {
      ... on NftImage {
        contractAddress
        tokenId
        uri
        chainId
        verified
      }
      ... on MediaSet {
        original {
          url
          mimeType
        }
      }
    }
  }
`
