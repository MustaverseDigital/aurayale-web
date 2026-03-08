/**
 * 鏈相關的工具函數和常數
 */

// Soneium Testnet (Minato) 的 Chain ID
export const SONEIUM_TESTNET_CHAIN_ID = 1946;

// BSC Testnet 的 Chain ID
export const BSC_TESTNET_CHAIN_ID = 97;

// Avalanche Fuji Testnet 的 Chain ID
export const AVAX_FUJI_CHAIN_ID = 43113;

/**
 * 檢查是否在 Soneium Testnet 上
 * @param chainId 鏈 ID
 * @returns 是否在 Soneium Testnet 上
 */
export function isSoneiumTestnet(chainId: number | undefined): boolean {
  return chainId === SONEIUM_TESTNET_CHAIN_ID;
}

/**
 * 檢查是否在 Avalanche Fuji Testnet 上
 * @param chainId 鏈 ID
 * @returns 是否在 Avalanche Fuji Testnet 上
 */
export function isAvaxFuji(chainId: number | undefined): boolean {
  return chainId === AVAX_FUJI_CHAIN_ID;
}
