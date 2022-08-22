import {
    ApolloClient,
    ApolloLink,
    HttpLink,
    InMemoryCache
} from '@apollo/client'
import { API_URL } from 'constants/constants'
import Cookies, { CookieAttributes } from 'js-cookie'
import jwtDecode from 'jwt-decode'
import axios from 'axios'
import { REFRESH_AUTHENTICATION_MUTATION } from 'graphql/query/authentication'

export const COOKIE_CONFIG: CookieAttributes = {
    sameSite: 'None',
    secure: true,
    expires: 720
}


const httpLink = new HttpLink({
    uri: API_URL
})

const authLink = new ApolloLink((operation, forward) => {
    const token = Cookies.get('accessToken')
    if (token === 'undefined' || !token) {
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        return forward(operation);

    }
    operation.setContext({
        headers: {
            'x-access-token': token ? `Bearer ${token}` : '',
        },
    });
    const { exp }: { exp: number } = jwtDecode(token)

    if (Date.now() >= exp * 1000) {
        console.log('[Auth]', 'Generate new access token')
        axios(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({
                operationName: 'Refresh',
                query: REFRESH_AUTHENTICATION_MUTATION,
                variables: {
                    request: { refreshToken: Cookies.get('refreshToken') }
                }
            })
        })
            .then(({ data }) => {
                console.log('refresh success', data)
                const refresh = data?.data?.refresh
                operation.setContext({
                    headers: {
                        'x-access-token': token
                            ? `Bearer ${refresh?.accessToken}`
                            : ''
                    }
                })
                Cookies.set('accessToken', refresh?.accessToken, COOKIE_CONFIG)
                Cookies.set('refreshToken', refresh?.refreshToken, COOKIE_CONFIG)
            })
            .catch(() => console.log("Reset access token failed"))
    }

    return forward(operation)

});

export const client = new ApolloClient({
    link: ApolloLink.from([authLink, httpLink]),
    cache: new InMemoryCache(),
});
