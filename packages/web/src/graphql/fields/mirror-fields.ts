import { gql } from '@apollo/client'
import { MinimalCollectModuleFields } from './collect-module-fileds'
import { MetadataFields } from './metadata-fields'
import { MinimalProfileFields } from './minimal-profile-fields'
import { StatsFields } from './stats-fields'

export const MirrorFields = gql`
  fragment MirrorFields on Mirror {
    id
    profile {
      name
      handle
    }
    reaction(request: $reactionRequest)
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
    mirrorOf {
      ... on Post {
        id
        profile {
          ...MinimalProfileFields
        }
        reaction(request: $reactionRequest)
        stats {
          ...StatsFields
        }
      }
      ... on Comment {
        id
        profile {
          ...MinimalProfileFields
        }
        reaction(request: $reactionRequest)
        stats {
          ...StatsFields
        }
      }
    }
    createdAt
    appId
  }
  ${MinimalProfileFields}
  ${MinimalCollectModuleFields}
  ${MetadataFields}
  ${StatsFields}
`