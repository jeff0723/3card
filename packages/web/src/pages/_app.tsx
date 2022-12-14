import { ApolloProvider } from '@apollo/client';
import {
  getDefaultWallets, midnightTheme, RainbowKitProvider
} from '@rainbow-me/rainbowkit';
import "@rainbow-me/rainbowkit/styles.css";
import { client } from 'apollo';
import Layout from 'components/Layout';
import { ALCHEMY_KEY, IS_DEVELOPMENT, MIXPANEL_TOKEN } from 'constants/constants';
import type { AppProps } from 'next/app';
import React from 'react';
import { Provider } from 'react-redux';
import store from "state";
import ApplicationUpdater from 'state/application/updater';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import '../styles/globals.css';
import { awsconfig } from "../settings";
import { Amplify } from "aws-amplify";
import SeaportProvider from 'providers/SeaportProvider';
import ErrorBoundary from 'components/Errorboundary';
import UserUpdater from 'state/user/updater';
import mixpanel from 'mixpanel-browser'

Amplify.configure({ ...awsconfig, ssr: true });

if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: IS_DEVELOPMENT,
    ignore_dnt: true
  })
}

const { chains, provider, webSocketProvider } = configureChains(
  [chain.polygonMumbai, chain.polygon],
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

function Updaters() {
  return (
    <>
      <ApplicationUpdater />
      <UserUpdater />
    </>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider appInfo={appInfo} chains={chains} theme={midnightTheme()} showRecentTransactions={true}>
            <ApolloProvider client={client}>
              <Updaters />
              <Layout>
                <SeaportProvider>
                  <Component {...pageProps} />
                </SeaportProvider>
              </Layout>
            </ApolloProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </Provider>
    </ErrorBoundary>
  )
}

export default React.memo(MyApp)
