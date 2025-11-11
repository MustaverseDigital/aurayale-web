export function getContractAddress(chainId: number): string {
  const addresses: Record<number, string> = {
    11155111: '0xCFAf2813a64A3b36bfCE431c9604648dFBB6Eacd', // Sepolia
    137: '0x...', // Polygon
    97: '0xCFAf2813a64A3b36bfCE431c9604648dFBB6Eacd', // BSC Testnet
  };

  return addresses[chainId] || '0xCFAf2813a64A3b36bfCE431c9604648dFBB6Eacd';
}
