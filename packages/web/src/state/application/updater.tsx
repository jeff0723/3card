import { useLazyQuery, useQuery } from '@apollo/client'
import { RECOMMENDED_PROFILES_QUERY } from 'graphql/query/recommended-profiles'
import React from 'react'
import { useAppDispatch } from 'state/hooks'
import { updateRecommedUser, updateRecommendedProfiles } from './reducer'

type Props = {}

const ApplicationUpdater = (props: Props) => {

  const dispatch = useAppDispatch()
  const { data, loading, error } = useQuery(RECOMMENDED_PROFILES_QUERY, {
    onCompleted(data) {
      console.log(
        '[Query]',
        `Fetched ${data?.recommendedProfiles?.length} recommended profiles`
      )
      dispatch(updateRecommendedProfiles({ recommendedProfiles: data?.recommendedProfiles }))
      //should add some logic to filter and generate a random profile
      dispatch(updateRecommedUser({ recommendUser: data?.recommendedProfiles[0] }))
    },
    onError(error) {
      console.error('[Query Error]', error)
    }
  })
  return null
}

export default ApplicationUpdater