import { createConfig } from '@privy-io/wagmi';
import { defineChain } from 'viem';
import { http } from 'wagmi';

export const soneiumMinato = defineChain({
  id: 1946,
  name: 'Soneium Minato Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.minato.soneium.org/'] },
  },
  blockExplorers: {
    default: { name: 'Soneium Minato Explorer', url: 'https://soneium-minato.blockscout.com/' },
  },
  testnet: true,
});

export const avaxFuji = defineChain({
  id: 43113,
  name: 'Avalanche Fuji Testnet',
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.avax-test.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Snowtrace (Fuji)', url: 'https://testnet.snowtrace.io/' },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [soneiumMinato, avaxFuji],
  transports: {
    [soneiumMinato.id]: http(),
    [avaxFuji.id]: http(),
  },
});
