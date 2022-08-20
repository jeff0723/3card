import { useLazyQuery } from '@apollo/client'
import { GET_PROFILE_BY_ADDRESS } from 'graphql/query/user'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import { updateLoadingStatus } from 'state/application/reducer'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
    setCurrentUser,
    setIsAuthenticated,
    setIsConnected
} from "state/user/reducer"

import { useAccount } from 'wagmi'
type Props = {}

const UserUpdater = (props: Props) => {
    const { address } = useAccount()
    const currentUser = useAppSelector(state => state.user.currentUser)
    const dispatch = useAppDispatch()
    const [getProfileByAddress, { error: errorProfiles, loading: profilesLoading }] =
        useLazyQuery(GET_PROFILE_BY_ADDRESS, {
            onCompleted(data) {
                console.log(
                    "[Lazy Query]",
                    `Fetched ${data?.profiles?.items?.length} user profiles for auth`
                );
            },
        });
    const updateStatus = async () => {
        dispatch(updateLoadingStatus({ isApplicationLoading: true }))
        const token = Cookies.get('accessToken')

        if (token && address) {
            console.log('have token!!!!')
            dispatch(setIsConnected({ isConnected: true }));
            dispatch(setIsAuthenticated({ isAuthenticated: true }));
            console.log('update')
            const { data: profilesData } = await getProfileByAddress({
                variables: { ownedBy: address },
            });
            if (profilesData?.profiles?.items?.length > 0) {
                // Cookies.set("profileId", profilesData?.profiles?.items[0].id)
                dispatch(
                    setCurrentUser({ currentUser: profilesData?.profiles?.items[0] })
                );
            }
        }
        dispatch(updateLoadingStatus({ isApplicationLoading: false }))

    }
    const logout = async () => {
        dispatch(updateLoadingStatus({ isApplicationLoading: true }))
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        dispatch(setIsConnected({ isConnected: false }));
        dispatch(setIsAuthenticated({ isAuthenticated: false }));
        dispatch(
            setCurrentUser({ currentUser: null })
        );
        dispatch(updateLoadingStatus({ isApplicationLoading: false }))

    }

    const update = async () => {
        if (currentUser?.ownedBy !== undefined && currentUser.ownedBy !== address) {
            console.log('logout!!!!')
            logout()
        }
        await updateStatus()
    }
    useEffect(() => {
        update()

    }, [address])

    console.log('address: ', address)
    const token = Cookies.get('accessToken')
    console.log('accessToken: ', token)
    console.log(currentUser)
    return null
}

export default UserUpdater