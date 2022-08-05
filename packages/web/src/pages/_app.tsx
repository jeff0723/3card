import '../styles/globals.css'
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from 'next/app'
import Layout from 'components/Layout'
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { ALCHEMY_KEY } from 'constants/constants'
import { publicProvider } from 'wagmi/providers/public';
import {
  getDefaultWallets,
  RainbowKitProvider,
  midnightTheme
} from '@rainbow-me/rainbowkit';
import { ThemeProvider } from 'styled-components';
import React from 'react';
import { client } from 'apollo';
import { ApolloProvider } from '@apollo/client';
import { Provider } from 'react-redux'
import store from "state"



const { chains, provider, webSocketProvider } = configureChains(
  [chain.polygon, chain.polygonMumbai],
  [
    alchemyProvider({ apiKey: ALCHEMY_KEY }),
    publicProvider()
  ]
);
const { connectors } = getDefaultWallets({
  appName: '3card',
  chains
});

const appInfo = {
  appName: '3card',

}

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider
})


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider appInfo={appInfo} chains={chains} theme={midnightTheme()} showRecentTransactions={true}>
          <ApolloProvider client={client}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ApolloProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </Provider>
  )
}

export default React.memo(MyApp)
