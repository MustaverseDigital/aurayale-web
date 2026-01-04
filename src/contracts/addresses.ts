import { SONEIUM_TESTNET_CHAIN_ID } from '../lib/chainUtils';

export function getContractAddress(chainId: number): string {
  const addresses: Record<number, string> = {
    97: '0x3fD693282Cb0680d975D8Fc74D6FF91655f68303', // BSC Testnet
    [SONEIUM_TESTNET_CHAIN_ID]: '0x3fD693282Cb0680d975D8Fc74D6FF91655f68303', // Soneium Testnet (Minato) - 使用與 BSC Testnet 相同的地址，請根據實際情況更新
    11155111: '0x...', // Sepolia
    137: '0x...', // Polygon
  };

  return addresses[chainId] || '0x3fD693282Cb0680d975D8Fc74D6FF91655f68303';
}
