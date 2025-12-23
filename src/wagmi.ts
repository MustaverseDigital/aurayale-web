import { createConfig } from '@privy-io/wagmi';
import { defineChain } from 'viem';
import { http } from 'wagmi';

export const soneiumMinato = defineChain({
  id: 1946,
  name: 'Soneium Minato',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.minato.soneium.org/'] },
  },
  blockExplorers: {
    default: { name: 'Soneium Minato Explorer', url: 'https://explorer-testnet.soneium.org' },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [soneiumMinato],
  transports: {
    [soneiumMinato.id]: http(),
  },
});
