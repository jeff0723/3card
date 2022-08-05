
import { gql } from '@apollo/client'
import { client } from 'apollo'

export const GET_CHALLENGE = `
  query($request: ChallengeRequest!) {
    challenge(request: $request) { text }
  }
`

export const generateChallenge = (address: string) => {
    return client.query({
        query: gql(GET_CHALLENGE),
        variables: {
            request: {
                address,
            },
        },
    })
}