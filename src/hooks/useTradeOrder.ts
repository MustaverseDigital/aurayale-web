import {
  useReadContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { useWallets, usePrivy, useSendTransaction } from '@privy-io/react-auth';
import { GemContract } from '../contracts/abis/index';
import { getContractAddress } from '../contracts/addresses';
import { Address, encodeFunctionData, Hash } from 'viem';
import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { getChainFromApiChainId, getDefaultChainForLoginType } from '../lib/chainUtils';

// Helper to get the correct wallet client and chain ID
// Priority: Privy Embedded Wallet (Strict)
// Uses UserContext to determine the target chain based on login type
function useActiveWallet() {
  const { chainId: wagmiChainId } = useAccount();
  const { wallets } = useWallets();
  const { user: privyUser, ready } = usePrivy();
  const { user } = useUser();

  // Determine target chain from user context (API chain string → EVM chain)
  const targetChain = user?.chainId
    ? getChainFromApiChainId(user.chainId)
    : getDefaultChainForLoginType(user?.loginType);

  // 1. Strict Priority: Match the specific wallet associated with the Privy User from wallets array
  let activeWallet: any = undefined;
  if (privyUser?.wallet && wallets.length > 0) {
    activeWallet = wallets.find(
      (w) => w.address.toLowerCase() === privyUser.wallet?.address.toLowerCase()
    );
  }

  // 2. Fallback: If no wallet found in wallets array but privyUser.wallet exists,
  // try to find any embedded wallet or use the first available wallet
  if (!activeWallet && wallets.length > 0) {
    activeWallet = wallets.find(
      (w) => w.walletClientType === 'privy' || w.connectorType === 'embedded'
    );
    if (!activeWallet) {
      activeWallet = wallets[0];
    }
  }

  // Robust parsing of chainId
  let walletChainId: number | undefined;
  if (activeWallet?.chainId) {
    if (typeof activeWallet.chainId === 'number') {
      walletChainId = activeWallet.chainId;
    } else if (typeof activeWallet.chainId === 'string') {
      const chainIdStr = activeWallet.chainId as string;
      if (chainIdStr.includes(':')) {
        const parts = chainIdStr.split(':');
        walletChainId =
          parts.length > 1 ? parseInt(parts[1]) : parseInt(parts[0]);
      } else {
        walletChainId = parseInt(chainIdStr);
      }
    }
  }

  // Use target chain from user context as fallback instead of hardcoded soneiumMinato
  const finalChainId = !isNaN(Number(walletChainId))
    ? Number(walletChainId)
    : wagmiChainId || (privyUser ? targetChain.id : undefined);

  return {
    chainId: finalChainId,
    activeWallet,
    hasWallet: !!activeWallet,
    privyUserWallet: privyUser?.wallet,
    ready,
    targetChain, // The EVM chain this user should be on
  };
}

// 讀取交易訂單資訊
export function useTradeOrder(orderId: bigint | undefined) {
  const { chainId } = useActiveWallet();
  const contractAddress = chainId
    ? (getContractAddress(chainId) as Address)
    : undefined;

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: GemContract,
    functionName: 'getTradeOrder',
    args: orderId !== undefined ? [orderId] : undefined,
    query: {
      enabled: !!orderId && !!contractAddress,
    },
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

// 建立交易訂單
export function useCreateTradeOrder() {
  const { chainId, activeWallet, hasWallet, privyUserWallet, ready, targetChain } =
    useActiveWallet();
  const contractAddress = chainId
    ? (getContractAddress(chainId) as Address)
    : undefined;

  // Use Privy's useSendTransaction hook
  const { sendTransaction } = useSendTransaction();
  const { createWallet } = usePrivy();

  const [txHash, setTxHash] = useState<Hash | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const createTradeOrder = async (
    offeredTokenId: bigint,
    wantedTokenIds: bigint[]
  ) => {
    if (!contractAddress) {
      console.error('Contract address not available');
      setError(new Error('Contract address not available'));
      return;
    }

    // Wait for Privy to be ready
    if (!ready) {
      console.error('Privy is not ready yet');
      setError(new Error('Wallet is still loading. Please wait...'));
      return;
    }

    // Check if we have a wallet
    if (!hasWallet && !activeWallet) {
      // If privyUser has a wallet address but it's not in wallets array, try to create wallet
      if (privyUserWallet?.address) {
        console.log(
          'Wallet address exists but not in wallets array. Attempting to create wallet...'
        );
        try {
          await createWallet();
          // After creating, the wallets array should update, but we need to wait
          setError(
            new Error('Wallet is being created. Please try again in a moment.')
          );
          return;
        } catch (err: any) {
          console.error('Error creating wallet:', err);
          setError(
            new Error('No active wallet found. Please create a wallet first.')
          );
          return;
        }
      } else {
        console.error(
          'No active Privy wallet found. Cannot create trade order.'
        );
        setError(
          new Error(
            'No active wallet found. Please create or connect a wallet first.'
          )
        );
        return;
      }
    }

    try {
      setIsPending(true);
      setError(null);

      // Switch chain if needed
      const currentChainId =
        typeof activeWallet.chainId === 'string'
          ? parseInt(activeWallet.chainId.split(':')[1] || activeWallet.chainId)
          : activeWallet.chainId;

      if (currentChainId !== targetChain.id) {
        await activeWallet.switchChain(targetChain.id);
      }

      // Encode the function call data
      const data = encodeFunctionData({
        abi: GemContract,
        functionName: 'createTradeOrder',
        args: [offeredTokenId, wantedTokenIds],
      });

      // Send transaction using Privy's sendTransaction
      const result = await sendTransaction(
        {
          to: contractAddress,
          data: data,
        },
        {
          address: activeWallet.address, // Specify the wallet to use
        }
      );

      setTxHash(result.hash);
    } catch (err: any) {
      console.error('Error creating trade order:', err);
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

  return {
    createTradeOrder,
    hash: txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// 接受交易訂單
export function useAcceptTradeOrder() {
  const { chainId, activeWallet, hasWallet, privyUserWallet, ready, targetChain } =
    useActiveWallet();
  const contractAddress = chainId
    ? (getContractAddress(chainId) as Address)
    : undefined;

  // Use Privy's useSendTransaction hook
  const { sendTransaction } = useSendTransaction();
  const { createWallet } = usePrivy();

  const [txHash, setTxHash] = useState<Hash | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const acceptTradeOrder = async (orderId: bigint, selectedTokenId: bigint) => {
    if (!contractAddress) {
      console.error('Contract address not available');
      setError(new Error('Contract address not available'));
      return;
    }

    // Wait for Privy to be ready
    if (!ready) {
      console.error('Privy is not ready yet');
      setError(new Error('Wallet is still loading. Please wait...'));
      return;
    }

    // Check if we have a wallet
    if (!hasWallet && !activeWallet) {
      // If privyUser has a wallet address but it's not in wallets array, try to create wallet
      if (privyUserWallet?.address) {
        console.log(
          'Wallet address exists but not in wallets array. Attempting to create wallet...'
        );
        try {
          await createWallet();
          setError(
            new Error('Wallet is being created. Please try again in a moment.')
          );
          return;
        } catch (err: any) {
          console.error('Error creating wallet:', err);
          setError(
            new Error('No active wallet found. Please create a wallet first.')
          );
          return;
        }
      } else {
        console.error(
          'No active Privy wallet found. Cannot accept trade order.'
        );
        setError(
          new Error(
            'No active wallet found. Please create or connect a wallet first.'
          )
        );
        return;
      }
    }

    try {
      setIsPending(true);
      setError(null);

      // Switch chain if needed
      const currentChainId =
        typeof activeWallet.chainId === 'string'
          ? parseInt(activeWallet.chainId.split(':')[1] || activeWallet.chainId)
          : activeWallet.chainId;

      if (currentChainId !== targetChain.id) {
        await activeWallet.switchChain(targetChain.id);
      }

      // Encode the function call data
      const data = encodeFunctionData({
        abi: GemContract,
        functionName: 'acceptTradeOrder',
        args: [orderId, selectedTokenId],
      });

      // Send transaction using Privy's sendTransaction
      const result = await sendTransaction(
        {
          to: contractAddress,
          data: data,
        },
        {
          address: activeWallet.address, // Specify the wallet to use
        }
      );

      setTxHash(result.hash);
    } catch (err: any) {
      console.error('Error accepting trade order:', err);
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

  return {
    acceptTradeOrder,
    hash: txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// 取消交易訂單
export function useCancelTradeOrder() {
  const { chainId, activeWallet, hasWallet, privyUserWallet, ready, targetChain } =
    useActiveWallet();
  const contractAddress = chainId
    ? (getContractAddress(chainId) as Address)
    : undefined;

  // Use Privy's useSendTransaction hook
  const { sendTransaction } = useSendTransaction();
  const { createWallet } = usePrivy();

  const [txHash, setTxHash] = useState<Hash | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const cancelTradeOrder = async (orderId: bigint) => {
    if (!contractAddress) {
      console.error('Contract address not available');
      setError(new Error('Contract address not available'));
      return;
    }

    // Wait for Privy to be ready
    if (!ready) {
      console.error('Privy is not ready yet');
      setError(new Error('Wallet is still loading. Please wait...'));
      return;
    }

    // Check if we have a wallet
    if (!hasWallet && !activeWallet) {
      // If privyUser has a wallet address but it's not in wallets array, try to create wallet
      if (privyUserWallet?.address) {
        console.log(
          'Wallet address exists but not in wallets array. Attempting to create wallet...'
        );
        try {
          await createWallet();
          setError(
            new Error('Wallet is being created. Please try again in a moment.')
          );
          return;
        } catch (err: any) {
          console.error('Error creating wallet:', err);
          setError(
            new Error('No active wallet found. Please create a wallet first.')
          );
          return;
        }
      } else {
        console.error(
          'No active Privy wallet found. Cannot cancel trade order.'
        );
        setError(
          new Error(
            'No active wallet found. Please create or connect a wallet first.'
          )
        );
        return;
      }
    }

    try {
      setIsPending(true);
      setError(null);

      // Switch chain if needed
      const currentChainId =
        typeof activeWallet.chainId === 'string'
          ? parseInt(activeWallet.chainId.split(':')[1] || activeWallet.chainId)
          : activeWallet.chainId;

      if (currentChainId !== targetChain.id) {
        await activeWallet.switchChain(targetChain.id);
      }

      // Encode the function call data
      const data = encodeFunctionData({
        abi: GemContract,
        functionName: 'cancelTradeOrder',
        args: [orderId],
      });

      // Send transaction using Privy's sendTransaction
      const result = await sendTransaction(
        {
          to: contractAddress,
          data: data,
        },
        {
          address: activeWallet.address, // Specify the wallet to use
        }
      );

      setTxHash(result.hash);
    } catch (err: any) {
      console.error('Error canceling trade order:', err);
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

  return {
    cancelTradeOrder,
    hash: txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
