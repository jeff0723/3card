import { gql } from '@apollo/client'
import { MinimalCollectModuleFields } from './collect-module-fileds'
import { MetadataFields } from './metadata-fields'
import { MinimalProfileFields } from './minimal-profile-fields'
import { StatsFields } from './stats-fields'


export const PostFields = gql`
  fragment PostFields on Post {
    id
    profile {
      ...MinimalProfileFields
    }
    reaction(request: $reactionRequest)
    mirrors(by: $profileId)
    collectedBy {
      address
      defaultProfile {
        ...MinimalProfileFields
      }
    }
    collectModule {
      ...MinimalCollectModuleFields
    }
    stats {
      ...StatsFields
    }
    metadata {
      ...MetadataFields
    }
    hidden
    hasCollectedByMe
    createdAt
    appId
  }
  ${MinimalProfileFields}
  ${MinimalCollectModuleFields}
  ${MetadataFields}
  ${StatsFields}
`

