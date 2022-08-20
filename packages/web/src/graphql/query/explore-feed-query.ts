import { gql } from "@apollo/client"
import { CommentFields } from "graphql/fields/comment-fields"
import { MirrorFields } from "graphql/fields/mirror-fields"
import { PostFields } from "graphql/fields/post-fields"


export const EXPLORE_FEED_QUERY = gql`
query ExploreFeed(
  $request: ExplorePublicationRequest!
  $reactionRequest: ReactionFieldResolverRequest
  $profileId: ProfileId
) {
  explorePublications(request: $request) {
    items {
      ... on Post {
        ...PostFields
      }
      ... on Comment {
        ...CommentFields
      }
      ... on Mirror {
        ...MirrorFields
      }
    }
    pageInfo {
      totalCount
      next
    }
  }
}
${PostFields}
${CommentFields}
${MirrorFields}
`