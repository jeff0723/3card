import { useLazyQuery } from '@apollo/client'
import { GET_PROFILE_BY_ADDRESS } from 'graphql/query/user'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import { updateLoadingStatus } from 'state/application/reducer'
import { useAppDispatch } from 'state/hooks'
import {
    setCurrentUser,
    setIsAuthenticated,
    setIsConnected
} from "state/user/reducer"

import { useAccount } from 'wagmi'
type Props = {}

const UserUpdater = (props: Props) => {
    const { address } = useAccount()
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
        dispatch(setIsConnected({ isConnected: true }));
        dispatch(setIsAuthenticated({ isAuthenticated: true }));
        if (token && address) {
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
    useEffect(() => {
        updateStatus()

    }, [])
    return null
}

export default UserUpdater