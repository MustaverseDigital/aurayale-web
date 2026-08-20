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

export const bscTestnet = defineChain({
  id: 97,
  name: 'BNB Smart Chain Testnet',
  nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18 },
  rpcUrls: {
    // 與 AuraServer chain.service.ts 的 'bsc-testnet' 設定保持一致。
    default: { http: ['https://data-seed-prebsc-1-s1.binance.org:8545/'] },
  },
  blockExplorers: {
    default: { name: 'BscScan Testnet', url: 'https://testnet.bscscan.com' },
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
  // bscTestnet 置首 = 預設鏈；其餘保留給既有 Farcaster / Avalanche 流程。
  chains: [bscTestnet, soneiumMinato, avaxFuji],
  transports: {
    [bscTestnet.id]: http(),
    [soneiumMinato.id]: http(),
    [avaxFuji.id]: http(),
  },
});
