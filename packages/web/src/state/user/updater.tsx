import { useLazyQuery } from '@apollo/client'
import { NEXT_API_KEY } from 'constants/constants'
import { GET_PROFILE_BY_ADDRESS } from 'graphql/query/user'
import Cookies from 'js-cookie'
import mixpanel from 'mixpanel-browser'
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
    const updateUserProfile = async () => {
        const { data: profilesData, error } = await getProfileByAddress({
            variables: { ownedBy: address },
        });
        if (profilesData?.profiles?.items?.length > 0) {
            dispatch(
                setCurrentUser({ currentUser: profilesData?.profiles?.items[0] })
            );
            mixpanel.identify(profilesData?.profilesData?.profiles?.items[0].id)
            mixpanel.people.set({
                address: profilesData?.profilesData?.profiles?.items[0].ownedBy,
                handle: profilesData?.profilesData?.profiles?.items[0].handle,
                name: profilesData?.profilesData?.profiles?.items[0].name,
            })
        } else {
            mixpanel.identify('0x00')
            mixpanel.people.set({
                name: 'Anonymous',
            })
        }
        if (error) {
            setTimeout(async () => {
                const { data: profilesData, error } = await getProfileByAddress({
                    variables: { ownedBy: address },
                });
                if (profilesData?.profiles?.items?.length > 0) {
                    dispatch(
                        setCurrentUser({ currentUser: profilesData?.profiles?.items[0] })
                    );
                    mixpanel.identify(profilesData?.profilesData?.profiles?.items[0].id)
                    mixpanel.people.set({
                        address: profilesData?.profilesData?.profiles?.items[0].ownedBy,
                        handle: profilesData?.profilesData?.profiles?.items[0].handle,
                        name: profilesData?.profilesData?.profiles?.items[0].name,
                    })
                } else {
                    mixpanel.identify('0x00')
                    mixpanel.people.set({
                        name: 'Anonymous',
                    })
                }
                if (error) {
                    dispatch(setIsConnected({ isConnected: false }));
                    dispatch(setIsAuthenticated({ isAuthenticated: false }));
                    console.log(error)
                }
            })
        }
        return
    }
    const updateStatus = async () => {
        dispatch(updateLoadingStatus({ isApplicationLoading: true }))
        const token = Cookies.get('accessToken')

        if (token && address) {
            console.log('have token!!!!')
            dispatch(setIsConnected({ isConnected: true }));
            dispatch(setIsAuthenticated({ isAuthenticated: true }));
            console.log('update')
            await updateUserProfile()

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
            logout()
        }
        await updateStatus()
    }
    useEffect(() => {
        update()

    }, [address])
    const updateData = async () => {
        if (currentUser) {
            await fetch(`/api/update/erc20?account=${currentUser.ownedBy}&chain=ether&apikey=${NEXT_API_KEY}`)
            await fetch(`/api/update/ranking?account=${currentUser.ownedBy}&chain=ether&apikey=${NEXT_API_KEY}`)
        }
    }

    useEffect(() => {
        updateData()
    }, [currentUser])

    return null
}

export default UserUpdater