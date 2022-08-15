import { gql } from "@apollo/client"
import { CommunityFields } from "graphql/fields/community-fields"

export const EXPLORE_COMMUNITY_QUERY = gql`
query (
  $request: ExplorePublicationRequest!
) {
  communities:explorePublications(request: $request) {
    items {
      ... on Post {
        ...CommunityFields
      }
    }
  }
}
${CommunityFields}
`

export const COMMUNITY_QUERY = gql`
  query Community($request: PublicationQueryRequest!) {
    publication(request: $request) {
      ... on Post {
        ...CommunityFields
      }
    }
  }
  ${CommunityFields}
  `