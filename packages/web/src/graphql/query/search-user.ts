import { gql } from "@apollo/client"
import { MinimalProfileFields } from "graphql/fields/minimal-profile-fields"
export const SEARCH_USERS_QUERY = gql`
  query SearchUsers($request: SearchQueryRequest!) {
    search(request: $request) {
      ... on ProfileSearchResult {
        items {
          ...MinimalProfileFields
        }
      }
    }
  }
  ${MinimalProfileFields}
`
