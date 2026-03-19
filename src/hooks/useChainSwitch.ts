import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useUser } from '../context/UserContext';
import {
  loginWithFarcaster,
  loginWithPrivy,
  loginWithPassword,
  getUserGems,
  getUserDeck,
} from '../api/auraServer';
import { generateFarcasterMessage } from '../lib/farcaster';
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
        case 'farcaster': {
          // Farcaster 登入 - 優先使用 Privy token 方式
          if (privyUser?.farcaster && getAccessToken) {
            // 使用 Privy token 方式（推薦，無需簽名）
            const privyToken = await getAccessToken();

            if (!privyToken) {
              throw new Error('無法獲取 Privy access token');
            }

            const response = await loginWithPrivy(
              privyToken,
              targetChain
            );

            newToken = response.token;
            newChainId = response.chainId;
            newUserData = {
              ...user,
              token: response.token,
              chainId: response.chainId,
              walletAddress: response.walletAddress,
              name: response.name,
              farcasterId: response.farcasterId,
              farcasterUsername: response.farcasterUsername,
              farcasterPfpUrl: response.farcasterPfpUrl,
            };
          } else {
            // 回退到簽名方式（向後兼容）
            const walletAddress =
              connectedAddress ||
              wallets.find((w) => w.walletClientType !== 'privy')?.address ||
              user.walletAddress;

            if (!walletAddress) {
              throw new Error('無法獲取錢包地址');
            }

            if (
              !isConnected &&
              !wallets.some((w) => w.address === walletAddress)
            ) {
              throw new Error('請先連接錢包');
            }

            const farcasterId = user.farcasterId || privyUser?.farcaster?.fid;
            const message = generateFarcasterMessage(
              walletAddress,
              farcasterId ? String(farcasterId) : undefined
            );

            const signature = await signMessageAsync({ message });
            const response = await loginWithFarcaster(
              walletAddress,
              signature,
              {
                farcasterId: farcasterId ? String(farcasterId) : undefined,
                chain_id: targetChain,
              }
            );

            newToken = response.token;
            newChainId = response.chainId;
            newUserData = {
              ...user,
              token: response.token,
              chainId: response.chainId,
              walletAddress: response.walletAddress,
              name: response.name,
              farcasterId: response.farcasterId,
              farcasterUsername: response.farcasterUsername,
              farcasterPfpUrl: response.farcasterPfpUrl,
            };
          }
          break;
        }

        case 'google': {
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
