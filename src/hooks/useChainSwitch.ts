import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useUser } from '../context/UserContext';
import {
  loginWithPrivy,
  loginWithPassword,
  getUserGems,
  getUserDeck,
} from '../api/auraServer';
import type { SupportedChain } from '../types/auraServer';

export function useChainSwitch() {
  const { user, setUser } = useUser();
  const { address: connectedAddress, isConnected } = useAccount();
  const { user: privyUser, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const { signMessageAsync } = useSignMessage();
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchChain = async (targetChain: SupportedChain) => {
    if (!user?.token || !user?.loginType) {
      setError('請先登入');
      return;
    }

    if (user.chainId === targetChain) {
      // 已經在目標鏈上，不需要切換
      return;
    }

    setIsSwitching(true);
    setError(null);

    try {
      let newToken: string;
      let newChainId: string;
      let newUserData: any;

      // 根據登入類型重新登入
      switch (user.loginType) {
        // Privy 登入（google / email / wallet）：一律用 Privy token 重新換發。
        // 先前 'farcaster' 與 'google' 是兩個分支，但兩者最終都呼叫
        // loginWithPrivy，且 Privy 未啟用 Farcaster，簽名回退路徑從未執行。
        case 'google':
        case 'email':
        case 'wallet': {
          const privyToken = await getAccessToken();
          if (!privyToken) {
            throw new Error('無法獲取 Privy access token');
          }
          const response = await loginWithPrivy(privyToken, targetChain);
          newToken = response.token;
          newChainId = response.chainId;
          newUserData = {
            ...user,
            token: response.token,
            chainId: response.chainId,
            walletAddress: response.walletAddress,
            name: response.name,
            loginType: response.loginType,
            email: response.email,
            avatarUrl: response.avatarUrl,
          };
          break;
        }

        case 'password': {
          // 密碼登入需要用戶名和密碼，這些信息我們沒有存儲
          throw new Error('密碼登入切換鏈需要重新登入');
        }

        default:
          throw new Error('不支援的登入類型');
      }

      // 重新載入用戶資料
      const [gems, deck] = await Promise.all([
        getUserGems(newToken),
        getUserDeck(newToken),
      ]);

      // 更新 UserContext
      setUser({
        ...newUserData,
        gems,
        deck,
      });
    } catch (e: any) {
      console.error('Chain switch error:', e);
      setError(e.message || '切換鏈失敗');
      throw e;
    } finally {
      setIsSwitching(false);
    }
  };

  const getChainDisplayName = (chainId?: string): string => {
    switch (chainId) {
      case 'bsc-testnet':
        return 'BSC Testnet';
      case 'soneium-testnet':
        return 'Soneium Testnet';
      case 'avax-fuji':
        return 'Avalanche Fuji';
      default:
        return chainId || 'Unknown';
    }
  };

  return {
    currentChain: user?.chainId as SupportedChain | undefined,
    switchChain,
    isSwitching,
    error,
    getChainDisplayName,
  };
}
