import { ApolloProvider } from '@apollo/client';
import {
  getDefaultWallets, midnightTheme, RainbowKitProvider
} from '@rainbow-me/rainbowkit';
import "@rainbow-me/rainbowkit/styles.css";
import { client } from 'apollo';
import Layout from 'components/Layout';
import { ALCHEMY_KEY } from 'constants/constants';
import type { AppProps } from 'next/app';
import React from 'react';
import { Provider } from 'react-redux';
import store from "state";
import ApplicationUpdater from 'state/application/updater';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import '../styles/globals.css';



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
    </>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider appInfo={appInfo} chains={chains} theme={midnightTheme()} showRecentTransactions={true}>
          <ApolloProvider client={client}>
            <Updaters />
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
