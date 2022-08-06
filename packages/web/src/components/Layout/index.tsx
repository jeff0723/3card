import React, { FC, ReactNode, Suspense, useEffect, useState, } from 'react'
import Head from 'next/head'
import styled from 'styled-components'
import dynamic from 'next/dynamic'
import { useAccount, useDisconnect, useNetwork, useSignMessage } from 'wagmi'
import { AUTHENTICATE_MUTATION, CHALLENGE_QUERY } from 'graphql/query/authentication'
import { useLazyQuery, useMutation } from '@apollo/client'
import toast, { Toaster } from 'react-hot-toast'
import { CURRENT_USER_QUERY } from 'graphql/query/user'
import Cookies from 'js-cookie'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setCurrentUser, setIsAuthenticated, setIsConnected } from 'state/user/reducer'

const Navbar = dynamic(() => import('./Navbar'), { suspense: true })
const SideBar = dynamic(() => import('./SideBar'), { suspense: true })
interface Props {
    children: ReactNode
}
const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`

const Content = styled.div`
    display: flex;
`
const toastOptions = {
    style: {
        background: "rgba(0, 0, 0)",
        color: "#ffffff"
    },
    success: {
        className: 'border border-green-500',
        iconTheme: {
            primary: '#10B981',
            secondary: 'white'
        }
    },
    error: {
        className: 'border border-red-500',
        iconTheme: {
            primary: '#EF4444',
            secondary: 'white'
        }
    },
    loading: { className: 'border border-gray-300' }
}
const Layout: FC<Props> = ({ children }) => {

    const dispatch = useAppDispatch()
    const userIsConnected = useAppSelector(state => state.user.isConnected)
    const [mounted, setMounted] = useState<boolean>(false)
    const { address, isDisconnected, isConnected } = useAccount()
    const { chain } = useNetwork()
    const { disconnect } = useDisconnect()
    const { signMessageAsync, isLoading: signLoading } = useSignMessage({
        onError(error) {
            toast.error(error?.message)
        }
    })
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
    }
    const handleSign = async () => {
        try {
            // Get challenge
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
            const { data: profilesData } = await getProfiles({
                variables: { ownedBy: address }
            })
            if (profilesData?.profiles?.items?.length > 0) {
                // Cookies.set("profileId", profilesData?.profiles?.items[0].id)
                dispatch(setCurrentUser({ currentUser: profilesData?.profiles?.items[0] }))
            }
            // console.log("profile data", profilesData)

        } catch (err) {

        }
    }
    useEffect(() => {
        setMounted(true)

    }, [[
        isDisconnected,
        address,
        chain,
        disconnect
    ]])
    useEffect(() => {
        //This entire section should be rewrote
        if (isConnected && mounted && !userIsConnected) {
            toast.success("logged in successfully")
            handleSign()
            return
        }
        if (isDisconnected && mounted) {
            toast.success("logged out successfully")
            logout()
            return
        }
    }, [isConnected, isDisconnected])
    if (!mounted) return <h1>Loading</h1>

    return (
        <Container>

            <Toaster position="top-right" toastOptions={toastOptions} />
            <Suspense fallback={<h1>Loading</h1>}>
                <Navbar />
                <Content>
                    <SideBar />
                    {children}
                </Content>
            </Suspense>
        </Container>
    )
}

export default Layout