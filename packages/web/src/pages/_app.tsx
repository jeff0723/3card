import '../styles/globals.css'
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
} from '@rainbow-me/rainbowkit';

const { chains, provider } = configureChains(
  [chain.polygon, chain.polygonMumbai],
  [
    alchemyProvider({ apiKey: ALCHEMY_KEY }),
    publicProvider()
  ]
);
const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default MyApp
