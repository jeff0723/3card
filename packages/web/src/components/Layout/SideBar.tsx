import { useLazyQuery, useMutation } from "@apollo/client"
import Button from 'components/UI/Button'
import { Spinner } from "components/UI/Spinner"
import {
    AUTHENTICATE_MUTATION,
    CHALLENGE_QUERY
} from "graphql/query/authentication"
import { GET_PROFILE_BY_ADDRESS } from "graphql/query/user"
import Cookies from "js-cookie"
import Link from 'next/link'
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { updateLoadingStatus } from 'state/application/reducer'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
    setCurrentUser,
    setIsAuthenticated,
    setIsConnected
} from "state/user/reducer"
import styled from 'styled-components'
import { useAccount, useSignMessage } from 'wagmi'
import CreateProfileModal from "./CreateProfileModal"
import ProfileCard from "./ProfileCard"
import { Mixpanel } from 'utils/Mixpanel';
import { useRouter } from "next/router"

type Props = {}

const Column = styled.div`
    display: flex;
    flex-direction: column;
    gap:10px;
    width: 224px;

`
const Text = styled.div<{ isSelectedTab: boolean }>`
    display: flex;
    align-items: flex-start;
    padding: 12px;
    font-weight: ${({ isSelectedTab }) => isSelectedTab ? "bold" : "400"};
    font-size: 20px;
    line-height: 24px;
`
enum Tab {
    Home,
    Communities,
    Messages,
    Card,
    Profile,
    Notifications
}
const pathToTab = {
    '/': Tab.Home,
    '/explore': Tab.Communities,
    '/messages': Tab.Messages,
    '/card': Tab.Card,
    '/profile': Tab.Profile,
    '/notifications': Tab.Notifications
}
const currentTab = (path: string): Tab => {
    switch (path) {
        case '/': return Tab.Home
        case '/explore': return Tab.Communities
        case '/messages': return Tab.Messages
        case '/card': return Tab.Card
        case '/profile': return Tab.Profile
        case '/notifications': return Tab.Notifications
        default: return Tab.Home
    }
}

function SideBar({ }: Props) {

    const { pathname } = useRouter()
    const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)
    const currentUser = useAppSelector(state => state.user.currentUser)
    const dispatch = useAppDispatch()
    const [selectedTab, setSelectedTab] = useState<Tab>(currentTab(pathname))
    const [open, setOpen] = useState(false)
    const { isConnected, address } = useAccount()
    useEffect(() => {
        setSelectedTab((currentTab(pathname)))
    }, [pathname])
    const { signMessageAsync, isLoading: signLoading } = useSignMessage({
        onError(error) {
            toast.error(error?.message);
        },
    });
    const isLoading = useAppSelector(
        (state) => state.application.isApplicationLoading
    );
    const [loadChallenge, { error: errorChallenge, loading: challengeLoading }] =
        useLazyQuery(CHALLENGE_QUERY, {
            fetchPolicy: "no-cache",
            onCompleted(data) {
                console.log(
                    "[Lazy Query]",
                    `Fetched auth challenge - ${data?.challenge?.text}`
                );
            },
        });

    const [authenticate, { error: errorAuthenticate, loading: authLoading }] =
        useMutation(AUTHENTICATE_MUTATION);
    const [getProfileByAddress, { error: errorProfiles, loading: profilesLoading }] =
        useLazyQuery(GET_PROFILE_BY_ADDRESS, {
            onCompleted(data) {
                console.log(
                    "[Lazy Query]",
                    `Fetched ${data?.profiles?.items?.length} user profiles for auth`
                );
            },
        });
    const login = async () => {
        try {
            // Get challenge
            dispatch(updateLoadingStatus({ isApplicationLoading: true }));
            const challenge = await loadChallenge({
                variables: { request: { address } },
            });

            if (!challenge?.data?.challenge?.text)
                return toast.error("Something went wrong!");

            // Get signature
            Mixpanel.track("publication.lens_login_sign_click")

            const signature = await signMessageAsync({
                message: challenge?.data?.challenge?.text,
            });

            // Auth user and set cookies
            const auth = await authenticate({
                variables: { request: { address, signature } },
            });
            Cookies.set("accessToken", auth?.data?.authenticate?.accessToken);
            Cookies.set("refreshToken", auth?.data?.authenticate?.refreshToken);

            // Get authed profiles
            dispatch(setIsConnected({ isConnected: true }));
            dispatch(setIsAuthenticated({ isAuthenticated: true }));
            Mixpanel.track("publication.lens_login", { result: 'success' })

            toast.success("Logged in successfully!");

            const { data: profilesData } = await getProfileByAddress({
                variables: { ownedBy: address },
            });
            if (profilesData?.profiles?.items?.length > 0) {
                // Cookies.set("profileId", profilesData?.profiles?.items[0].id)
                dispatch(
                    setCurrentUser({ currentUser: profilesData?.profiles?.items[0] })
                );
                Mixpanel.identify(profilesData?.profilesData?.profiles?.items[0].id)
                Mixpanel.people.set({
                    address: profilesData?.profilesData?.profiles?.items[0].ownedBy,
                    handle: profilesData?.profilesData?.profiles?.items[0].handle,
                    name: profilesData?.profilesData?.profiles?.items[0].name,
                })

            } else {
                Mixpanel.identify('0x00')
                Mixpanel.people.set({
                    name: 'Anonymous',
                })
            }
        } catch (err) {
            Mixpanel.track("publication.lens_login", { result: 'auth_err' })

        } finally {
            dispatch(updateLoadingStatus({ isApplicationLoading: false }));
        }
    };

    return (
        <div className='border border-transparent border-r-[#2F3336] flex flex-col justify-between px-4 pb-4'>
            <Column>
                <Link href='/'>
                    <div onClick={() => {
                        Mixpanel.track('visit_home')
                        setSelectedTab(Tab.Home)
                    }} className='rounded-md hover:bg-white hover:bg-opacity-10'>
                        <Text isSelectedTab={Tab.Home == selectedTab}>
                            Home
                        </Text>
                    </div>
                </Link>
                <Link href='/explore' >
                    <div onClick={() => {
                        Mixpanel.track('visit_communities')
                        setSelectedTab(Tab.Communities)
                    }} className='rounded-md hover:bg-white hover:bg-opacity-10'>
                        <Text isSelectedTab={Tab.Communities == selectedTab}>
                            Communities
                        </Text>
                    </div>
                </Link>

                {
                    currentUser && (
                        <>
                            <Link href='/messages'>
                                <div onClick={() => {
                                    Mixpanel.track('visit_messages')
                                    setSelectedTab(Tab.Messages)
                                }} className='rounded-md hover:bg-white hover:bg-opacity-10'>
                                    <Text isSelectedTab={Tab.Messages == selectedTab}>
                                        Messages
                                    </Text>
                                </div>
                            </Link>
                            <Link href='/notifications'>
                                <div onClick={() => {
                                    Mixpanel.track('visit_notifications')
                                    setSelectedTab(Tab.Notifications)
                                }} className='rounded-md hover:bg-white hover:bg-opacity-10'>
                                    <Text isSelectedTab={Tab.Notifications == selectedTab}>
                                        Notifications
                                    </Text>
                                </div>
                            </Link>
                            <Link href={`/card`}>
                                <div onClick={() => {
                                    Mixpanel.track('visit_card')
                                    setSelectedTab(Tab.Card)
                                }} className='rounded-md hover:bg-white hover:bg-opacity-10'>
                                    <Text isSelectedTab={Tab.Card == selectedTab}>
                                        Card
                                    </Text>
                                </div>
                            </Link>
                            <Link href={`/user/${currentUser.handle}`}>
                                <div onClick={() => {
                                    Mixpanel.track('visit_profile')
                                    setSelectedTab(Tab.Profile)
                                }} className='rounded-md hover:bg-white hover:bg-opacity-10'>
                                    <Text isSelectedTab={Tab.Profile == selectedTab}>
                                        Profile
                                    </Text>
                                </div>
                            </Link>

                        </>
                    )
                }


            </Column>
            <div className="flex flex-col gap-2">
                {isConnected && isAuthenticated && !currentUser && !isLoading && <div className="text-gray-400 italic">You don&apos;t have a profile yet</div>}
                {isConnected && !currentUser &&
                    <Button
                        disabled={isLoading}
                        onClick={
                            !isAuthenticated ? login : () => { setOpen(true) }
                        } className='h-12 w-full'
                        icon={isLoading && <Spinner size="sm" />}
                    >
                        {!isAuthenticated && "Login to Lens"}
                        {isAuthenticated && !isLoading && !currentUser && "Create"}

                    </Button>
                }
                {!isLoading && isConnected && currentUser && <ProfileCard profile={currentUser} />}
            </div>
            <CreateProfileModal open={open} setOpen={setOpen} />
        </div>
    )
}

export default SideBar