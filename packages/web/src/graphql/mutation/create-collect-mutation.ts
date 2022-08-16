import { gql } from "@apollo/client"

export const CREATE_COLLECT_TYPED_DATA_MUTATION = gql`
mutation CreateCollectTypedData(
  $options: TypedDataOptions
  $request: CreateCollectRequest!
) {
  createCollectTypedData(options: $options, request: $request) {
    id
    expiresAt
    typedData {
      types {
        CollectWithSig {
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
        pubId
        data
      }
    }
  }
}
`