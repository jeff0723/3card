import { gql } from "@apollo/client"


export const CREATE_SET_PROFILE_METADATA_TYPED_DATA_MUTATION = gql`
  mutation CreateSetProfileMetadataTypedData(
    $request: CreatePublicSetProfileMetadataURIRequest!
  ) {
    createSetProfileMetadataTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          SetProfileMetadataURIWithSig {
            name
            type
          }
        }
        domain {
          name
          chainId
          version
          verifyingContract
        }
        value {
          nonce
          deadline
          profileId
          metadata
        }
      }
    }
  }
`