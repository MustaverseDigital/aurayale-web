/**
 * 鏈相關的工具函數和常數
 */

import { soneiumMinato, avaxFuji } from '../wagmi';
import type { Chain } from 'viem';

// Soneium Testnet (Minato) 的 Chain ID
export const SONEIUM_TESTNET_CHAIN_ID = 1946;

// BSC Testnet 的 Chain ID
export const BSC_TESTNET_CHAIN_ID = 97;

// Avalanche Fuji Testnet 的 Chain ID
export const AVAX_FUJI_CHAIN_ID = 43113;

/**
 * API chain string (如 'soneium-testnet', 'avax-fuji') → EVM Chain 物件
 */
export function getChainFromApiChainId(apiChainId: string | undefined): Chain {
  switch (apiChainId) {
    case 'avax-fuji':
      return avaxFuji;
    case 'soneium-testnet':
    default:
      return soneiumMinato;
  }
}

/**
 * API chain string → EVM numeric chain ID
 */
export function getEvmChainId(apiChainId: string | undefined): number {
  return getChainFromApiChainId(apiChainId).id;
}

/**
 * 從登入類型推斷預設鏈
 */
export function getDefaultChainForLoginType(loginType: string | undefined): Chain {
  switch (loginType) {
    case 'google':
      return avaxFuji;
    default:
      return soneiumMinato;
  }
}

/**
 * 檢查是否在 Soneium Testnet 上
 */
export function isSoneiumTestnet(chainId: number | undefined): boolean {
  return chainId === SONEIUM_TESTNET_CHAIN_ID;
}

/**
 * 檢查是否在 Avalanche Fuji Testnet 上
 */
export function isAvaxFuji(chainId: number | undefined): boolean {
  return chainId === AVAX_FUJI_CHAIN_ID;
}
