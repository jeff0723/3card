import { gql } from "@apollo/client"
import { MinimalProfileFields } from "../fields/minimal-profile-fields"


export const GET_PROFILE_BY_ADDRESS = gql`
  query getProfileByAddress($ownedBy: [EthereumAddress!]) {
    profiles(request: { ownedBy: $ownedBy }) {
      items {
        ...MinimalProfileFields
        isDefault
      }
    }
    userSigNonces {
      lensHubOnChainSigNonce
    }
  }
  ${MinimalProfileFields}
`