import { SONEIUM_TESTNET_CHAIN_ID, AVAX_FUJI_CHAIN_ID } from '../lib/chainUtils';

export function getContractAddress(chainId: number): string {
  const addresses: Record<number, string> = {
    97: '0x3fD693282Cb0680d975D8Fc74D6FF91655f68303', // BSC Testnet
    [SONEIUM_TESTNET_CHAIN_ID]: '0x6555105Fd4BDE83514Fe90921B836f9a3B92da7c', // Soneium Testnet (Minato)
    [AVAX_FUJI_CHAIN_ID]: '0x6555105Fd4BDE83514Fe90921B836f9a3B92da7c', // Avalanche Fuji Testnet - TODO: 部署後更新為正確地址
    11155111: '0x...', // Sepolia
    137: '0x...', // Polygon
  };

  return addresses[chainId] || '';
}
