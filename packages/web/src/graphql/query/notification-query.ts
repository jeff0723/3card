import { gql } from "@apollo/client"
import { CollectModuleFields } from "graphql/fields/collect-module-fileds"
import { MetadataFields } from "graphql/fields/metadata-fields"
import { MinimalProfileFields } from "graphql/fields/minimal-profile-fields"

export const NOTIFICATIONS_QUERY = gql`
  query Notifications($request: NotificationRequest!) {
    notifications(request: $request) {
      items {
        ... on NewFollowerNotification {
          wallet {
            address
            defaultProfile {
              ...MinimalProfileFields
            }
          }
          createdAt
        }
        ... on NewMentionNotification {
          mentionPublication {
            ... on Post {
              id
              profile {
                ...MinimalProfileFields
              }
              metadata {
                content
              }
            }
            ... on Comment {
              id
              profile {
                ...MinimalProfileFields
              }
              metadata {
                content
              }
            }
          }
          createdAt
        }
        ... on NewCommentNotification {
          profile {
            ...MinimalProfileFields
          }
          comment {
            id
            metadata {
              content
            }
            commentOn {
              ... on Post {
                id
              }
              ... on Comment {
                id
              }
              ... on Mirror {
                id
              }
            }
          }
          createdAt
        }
        ... on NewMirrorNotification {
          profile {
            ...MinimalProfileFields
          }
          publication {
            ... on Post {
              id
              metadata {
                name
                content
                attributes {
                  value
                }
              }
            }
            ... on Comment {
              id
              metadata {
                name
                content
                attributes {
                  value
                }
              }
            }
          }
          createdAt
        }
        ... on NewCollectNotification {
          wallet {
            address
            defaultProfile {
              ...MinimalProfileFields
            }
          }
          collectedPublication {
            ... on Post {
              id
              metadata {
                ...MetadataFields
              }
              collectModule {
                ...CollectModuleFields
              }
            }
            ... on Comment {
              id
              metadata {
                ...MetadataFields
              }
              collectModule {
                ...CollectModuleFields
              }
            }
          }
          createdAt
        }
      }
      pageInfo {
        next
      }
    }
  }
  ${MinimalProfileFields}
  ${CollectModuleFields}
  ${MetadataFields}
`

export const NOTIFICATION_COUNT_QUERY = gql`
query NotificationCount($request: NotificationRequest!) {
  notifications(request: $request) {
    pageInfo {
      totalCount
    }
  }
}
`
