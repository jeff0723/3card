import {
    ApolloClient,
    ApolloLink,
    HttpLink,
    InMemoryCache
} from '@apollo/client'
import { API_URL } from 'constants/constants'

const httpLink = new HttpLink({
    uri: API_URL
})
const authLink = new ApolloLink((operation, forward) => {
    const token = window.sessionStorage.getItem('accessToken')
    operation.setContext({
        headers: {
            'x-access-token': token ? `Bearer ${token}` : '',
        },
    });
    return forward(operation);
});

export const client = new ApolloClient({
    link: ApolloLink.from([authLink, httpLink]),
    cache: new InMemoryCache(),
});
