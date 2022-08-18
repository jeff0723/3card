import { gql } from "@apollo/client"
import { CommentFields } from "graphql/fields/comment-fields"
import { MirrorFields } from "graphql/fields/mirror-fields"
import { PostFields } from "graphql/fields/post-fields"


export const HOME_FEED_QUERY = gql`
  query HomeFeed(
    $request: TimelineRequest!
    $reactionRequest: ReactionFieldResolverRequest
    $profileId: ProfileId
  ) {
    timeline(request: $request) {
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
        next
        totalCount
      }
    }
  }
  ${PostFields}
  ${MirrorFields}
  ${CommentFields}
`