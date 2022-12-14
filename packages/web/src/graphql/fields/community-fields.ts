import { gql } from '@apollo/client'

import { MetadataFields } from './metadata-fields'

export const CommunityFields = gql`
  fragment CommunityFields on Post {
    id
    hasCollectedByMe
    profile {
      id
    }
    metadata {
      ...MetadataFields
    }
    stats {
      totalAmountOfCollects
      totalAmountOfComments
    }
    createdAt
  }
  ${MetadataFields}
`
