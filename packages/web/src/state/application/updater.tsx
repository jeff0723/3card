import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { AUTHENTICATE_MUTATION, CHALLENGE_QUERY } from 'graphql/query/authentication'
import { RECOMMENDED_PROFILES_QUERY } from 'graphql/query/recommended-profiles'
import { CURRENT_USER_QUERY } from 'graphql/query/user'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { updateLoadingStatus } from 'state/application/reducer'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setCurrentUser, setIsAuthenticated, setIsConnected } from 'state/user/reducer'
import { useAccount, useDisconnect, useSignMessage } from 'wagmi'
import { updateRecommedUser, updateRecommendedProfiles } from './reducer'
type Props = {}

const ApplicationUpdater = (props: Props) => {

  const userIsConnected = useAppSelector(state => state.user.isConnected)
  const { address, isDisconnected, isConnected, connector } = useAccount()
  const { disconnect } = useDisconnect()


  const { signMessageAsync, isLoading: signLoading } = useSignMessage({
    onError(error) {
      toast.error(error?.message)
    }
  })
  const dispatch = useAppDispatch()
  const [loadChallenge, { error: errorChallenge, loading: challengeLoading }] =
    useLazyQuery(CHALLENGE_QUERY, {
      fetchPolicy: 'no-cache',
      onCompleted(data) {
        console.log(
          '[Lazy Query]',
          `Fetched auth challenge - ${data?.challenge?.text}`
        )
      }
    })

  const [authenticate, { error: errorAuthenticate, loading: authLoading }] =
    useMutation(AUTHENTICATE_MUTATION)
  const [getProfiles, { error: errorProfiles, loading: profilesLoading }] =
    useLazyQuery(CURRENT_USER_QUERY, {
      onCompleted(data) {
        console.log(
          '[Lazy Query]',
          `Fetched ${data?.profiles?.items?.length} user profiles for auth`
        )
      }
    })


  const logout = () => {
    dispatch(setIsConnected({ isConnected: false }))
    dispatch(setIsAuthenticated({ isAuthenticated: false }))
    dispatch(setCurrentUser({ currentUser: null }))
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
    if (disconnect) disconnect()
    toast.success("Logged out successfully!")

  }
  const login = async () => {
    try {
      // Get challenge
      dispatch(updateLoadingStatus({ isApplicationLoading: true }))
      const challenge = await loadChallenge({
        variables: { request: { address } }
      })

      if (!challenge?.data?.challenge?.text) return toast.error("Something went wrong!")

      // Get signature
      const signature = await signMessageAsync({
        message: challenge?.data?.challenge?.text
      })

      // Auth user and set cookies
      const auth = await authenticate({
        variables: { request: { address, signature } }
      })
      Cookies.set("accessToken", auth?.data?.authenticate?.accessToken)
      Cookies.set("refreshToken", auth?.data?.authenticate?.refreshToken)
      // Get authed profiles
      dispatch(setIsConnected({ isConnected: true }))
      dispatch(setIsAuthenticated({ isAuthenticated: true }))
      toast.success("Logged in successfully!")

      const { data: profilesData } = await getProfiles({
        variables: { ownedBy: address }
      })
      if (profilesData?.profiles?.items?.length > 0) {
        // Cookies.set("profileId", profilesData?.profiles?.items[0].id)
        dispatch(setCurrentUser({ currentUser: profilesData?.profiles?.items[0] }))
      }

    } catch (err) {

    }
    finally {
      dispatch(updateLoadingStatus({ isApplicationLoading: false }))
    }
  }
  const { data, loading, error } = useQuery(RECOMMENDED_PROFILES_QUERY, {
    onCompleted(data) {
      console.log(
        '[Query]',
        `Fetched ${data?.recommendedProfiles?.length} recommended profiles`
      )
      console.log("fetched:", data)
      dispatch(updateRecommendedProfiles({ recommendedProfiles: data?.recommendedProfiles }))
      //should add some logic to filter and generate a random profile
      dispatch(updateRecommedUser({ recommendUser: data?.recommendedProfiles[0] }))
    },
    onError(error) {
      console.error('[Query Error]', error)
    }
  })

  useEffect(() => {
    if (isConnected && connector && !userIsConnected) {
      login()

    }

  }, [isConnected, connector])
  useEffect(() => {
    if (isDisconnected && !connector && userIsConnected) {
      logout()

    }
  }, [isDisconnected, connector])
  return null
}

export default ApplicationUpdater