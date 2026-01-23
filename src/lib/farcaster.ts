/**
 * Farcaster 登入相關工具函數
 */

/**
 * 生成 Farcaster 認證消息
 * @param walletAddress 錢包地址
 * @param farcasterId Farcaster ID (fid)，可選
 * @returns 格式化的認證消息
 */
export function generateFarcasterMessage(
  walletAddress: string,
  farcasterId?: string | number
): string {
  const fid = farcasterId ? String(farcasterId) : '';
  return `Sign in to Aura Server with Farcaster

Wallet: ${walletAddress}${fid ? `\nFID: ${fid}` : ''}`;
}

/**
 * 使用 wagmi 簽名消息
 * 注意：這個函數需要在 React 組件中使用 wagmi hooks
 * 這裡提供一個輔助函數來處理簽名邏輯
 */
export async function signMessageWithWallet(
  signMessageAsync: (message: string) => Promise<`0x${string}`>,
  message: string
): Promise<string> {
  try {
    const signature = await signMessageAsync(message);
    return signature;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign message');
  }
}

