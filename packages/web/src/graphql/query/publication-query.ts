import { gql } from "@apollo/client"
import { CommentFields } from "graphql/fields/comment-fields"
import { MirrorFields } from "graphql/fields/mirror-fields"
import { PostFields } from "graphql/fields/post-fields"

export const PUBLICATION_QUERY = gql`
  query Publication(
    $request: PublicationQueryRequest!
    $reactionRequest: ReactionFieldResolverRequest
    $profileId: ProfileId
  ) {
    publication(request: $request) {
      ... on Post {
        ...PostFields
        onChainContentURI
        profile {
          isFollowedByMe
        }
        referenceModule {
          __typename
        }
      }
      ... on Comment {
        ...CommentFields
        onChainContentURI
        profile {
          isFollowedByMe
        }
        referenceModule {
          __typename
        }
      }
      ... on Mirror {
        ...MirrorFields
        onChainContentURI
        profile {
          isFollowedByMe
        }
        referenceModule {
          __typename
        }
      }
    }
  }
  ${PostFields}
  ${CommentFields}
  ${MirrorFields}
`
