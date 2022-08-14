import { gql } from "@apollo/client"

export const ENABLED_MODULES = gql`
  query {
    enabledModules {
      collectModules {
        moduleName
        contractAddress
        inputParams {
          name
          type
        }
        redeemParams {
          name
          type
        }
        returnDataParms {
          name
          type
        }
      }
      followModules {
        moduleName
        contractAddress
        inputParams {
          name
          type
        }
        redeemParams {
          name
          type
        }
        returnDataParms {
          name
          type
        }
      }
      referenceModules {
        moduleName
        contractAddress
        inputParams {
          name
          type
        }
        redeemParams {
          name
          type
        }
        returnDataParms {
          name
          type
        }
      }
    }
    }
`