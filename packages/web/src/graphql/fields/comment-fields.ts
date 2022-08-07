import { gql } from '@apollo/client'
import { MinimalCollectModuleFields } from './collect-module-fileds'
import { MetadataFields } from './metadata-fields'
import { MinimalProfileFields } from './minimal-profile-fields'
import { StatsFields } from './stats-fields'


export const CommentFields = gql`
  fragment CommentFields on Comment {
    id
    profile {
      ...MinimalProfileFields
    }
    reaction(request: $reactionRequest)
    mirrors(by: $profileId)
    collectedBy {
      address
      defaultProfile {
        handle
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
    commentOn {
      ... on Post {
        pubId: id
        profile {
          ...MinimalProfileFields
        }
        reaction(request: $reactionRequest)
        mirrors(by: $profileId)
        collectedBy {
          address
          defaultProfile {
            handle
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
        createdAt
      }
      ... on Comment {
        id
        profile {
          ...MinimalProfileFields
        }
        reaction(request: $reactionRequest)
        mirrors(by: $profileId)
        collectedBy {
          address
          defaultProfile {
            handle
          }
        }
        collectModule {
          ...MinimalCollectModuleFields
        }
        metadata {
          ...MetadataFields
        }
        stats {
          ...StatsFields
        }
        mainPost {
          ... on Post {
            id
            profile {
              ...MinimalProfileFields
            }
            reaction(request: $reactionRequest)
            mirrors(by: $profileId)
            collectedBy {
              address
              defaultProfile {
                handle
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
            createdAt
          }
          ... on Mirror {
            id
            profile {
              ...MinimalProfileFields
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
            mirrorOf {
              ... on Post {
                id
                reaction(request: $reactionRequest)
                mirrors(by: $profileId)
                profile {
                  ...MinimalProfileFields
                }
                stats {
                  ...StatsFields
                }
                hidden
              }
              ... on Comment {
                id
                reaction(request: $reactionRequest)
                mirrors(by: $profileId)
                profile {
                  ...MinimalProfileFields
                }
                stats {
                  ...StatsFields
                }
                hidden
              }
            }
            createdAt
          }
        }
        hidden
        createdAt
      }
      ... on Mirror {
        id
        reaction(request: $reactionRequest)
        profile {
          ...MinimalProfileFields
        }
        metadata {
          ...MetadataFields
        }
        mirrorOf {
          ... on Post {
            id
            profile {
              ...MinimalProfileFields
            }
            reaction(request: $reactionRequest)
            mirrors(by: $profileId)
            stats {
              ...StatsFields
            }
            hidden
          }
          ... on Comment {
            id
            profile {
              ...MinimalProfileFields
            }
            reaction(request: $reactionRequest)
            mirrors(by: $profileId)
            stats {
              ...StatsFields
            }
            hidden
          }
        }
        stats {
          ...StatsFields
        }
        hidden
        createdAt
      }
    }
    hidden
    createdAt
    appId
  }
  ${MinimalProfileFields}
  ${MinimalCollectModuleFields}
  ${MetadataFields}
  ${StatsFields}
`