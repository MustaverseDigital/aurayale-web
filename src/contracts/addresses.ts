export function getContractAddress(chainId: number): string {
  const addresses: Record<number, string> = {
    97: '0x3fD693282Cb0680d975D8Fc74D6FF91655f68303', // BSC Testnet
    11155111: '0x...', // Sepolia
    137: '0x...', // Polygon
  };

  return addresses[chainId] || '0x3fD693282Cb0680d975D8Fc74D6FF91655f68303';
}
