import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { useWallets, usePrivy } from '@privy-io/react-auth';
import { GemContract } from '../contracts/abis/index';
import { getContractAddress } from '../contracts/addresses';
import { Address, createWalletClient, custom, Hash } from 'viem';
import { soneiumMinato } from '../wagmi';
import { useState } from 'react';

// Helper to get the correct wallet client and chain ID
// Priority: Privy Embedded Wallet -> Other Connected Wallets (skipping Coinbase if unsupported) -> Wagmi Connected Wallet -> Default Chain (if logged in)
function useActiveWallet() {
  const { chainId: wagmiChainId } = useAccount();
  const { wallets } = useWallets();
  const { user: privyUser } = usePrivy();
  
  //Debug logs
  console.log('Available wallets:', wallets.map(w => ({ type: w.walletClientType, connector: w.connectorType, address: w.address })));
  console.log('Privy User Wallet:', privyUser?.wallet);

  // 1. Priority: Match the specific wallet associated with the Privy User (e.g. Embedded Wallet)
  let activeWallet: any = undefined;
  if (privyUser?.wallet) {
    activeWallet = wallets.find(w => w.address.toLowerCase() === privyUser.wallet?.address.toLowerCase());
  }

  // 2. If not found, try to find ANY Privy Embedded Wallet
  if (!activeWallet) {
    activeWallet = wallets.find(w => w.walletClientType === 'privy' || w.connectorType === 'embedded');
  }

  // NOTE: We do NOT fallback to other wallets here. We ONLY want Privy wallets.
  
  // Robust parsing of chainId
  let walletChainId: number | undefined;
  if (activeWallet?.chainId) {
    // If it's already a number
    if (typeof activeWallet.chainId === 'number') {
      walletChainId = activeWallet.chainId;
    } 
    // If it's a string, try to parse
    else if (typeof activeWallet.chainId === 'string') {
      const chainIdStr = activeWallet.chainId as string;
      if (chainIdStr.includes(':')) {
        // e.g., "eip155:1946"
        const parts = chainIdStr.split(':');
        walletChainId = parts.length > 1 ? parseInt(parts[1]) : parseInt(parts[0]);
      } else {
        // e.g., "1946"
        walletChainId = parseInt(chainIdStr);
      }
    }
  }

  // Fallback to Wagmi chainId if parsing failed or no active wallet
  // If neither is available but user is logged in (Privy), default to Soneium Minato (1946) to ensure Read operations work
  const finalChainId = !isNaN(Number(walletChainId)) 
    ? Number(walletChainId) 
    : (wagmiChainId || (privyUser ? soneiumMinato.id : undefined));

  return {
    chainId: finalChainId,
    activeWallet
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
  const { chainId, activeWallet } = useActiveWallet();
  const contractAddress = chainId
    ? (getContractAddress(chainId) as Address)
    : undefined;

  // Wagmi state
  const { writeContract, data: wagmiHash, error: wagmiError, isPending: wagmiIsPending } = useWriteContract();
  
  // Custom state for Privy interaction
  const [privyHash, setPrivyHash] = useState<Hash | undefined>(undefined);
  const [privyIsPending, setPrivyIsPending] = useState(false);
  const [privyError, setPrivyError] = useState<Error | null>(null);

  const hash = privyHash || wagmiHash;
  const error = privyError || wagmiError;
  const isPending = privyIsPending || wagmiIsPending;

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createTradeOrder = async (
    offeredTokenId: bigint,
    wantedTokenIds: bigint[]
  ) => {
    if (!contractAddress) return;

    // If we have an active Privy wallet, use it directly
    if (activeWallet) {
      try {
        setPrivyIsPending(true);
        setPrivyError(null);
        
        // Switch chain if needed
        const currentChainId = parseInt(activeWallet.chainId.split(':')[1] || activeWallet.chainId);
        if (currentChainId !== soneiumMinato.id) {
           await activeWallet.switchChain(soneiumMinato.id);
        }

        const provider = await activeWallet.getEthereumProvider();
        const walletClient = createWalletClient({
          account: activeWallet.address as Address,
          chain: soneiumMinato,
          transport: custom(provider)
        });

        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: GemContract,
          functionName: 'createTradeOrder',
          args: [offeredTokenId, wantedTokenIds],
        });

        setPrivyHash(txHash);
      } catch (err: any) {
        console.error('Error using Privy wallet:', err);
        setPrivyError(err);
      } finally {
        setPrivyIsPending(false);
      }
    } else {
      // Fallback to Wagmi
      writeContract({
        address: contractAddress,
        abi: GemContract,
        functionName: 'createTradeOrder',
        args: [offeredTokenId, wantedTokenIds],
      });
    }
  };

  return {
    createTradeOrder,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// 接受交易訂單
export function useAcceptTradeOrder() {
  const { chainId, activeWallet } = useActiveWallet();
  console.log('Active ChainId:', chainId);
  const contractAddress = chainId
    ? (getContractAddress(chainId) as Address)
    : undefined;

  // Wagmi state
  const { writeContract, data: wagmiHash, error: wagmiError, isPending: wagmiIsPending } = useWriteContract();
  
  // Custom state for Privy interaction
  const [privyHash, setPrivyHash] = useState<Hash | undefined>(undefined);
  const [privyIsPending, setPrivyIsPending] = useState(false);
  const [privyError, setPrivyError] = useState<Error | null>(null);

  const hash = privyHash || wagmiHash;
  const error = privyError || wagmiError;
  const isPending = privyIsPending || wagmiIsPending;

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const acceptTradeOrder = async (orderId: bigint, selectedTokenId: bigint) => {
    if (!contractAddress) return;

    if (activeWallet) {
      try {
        setPrivyIsPending(true);
        setPrivyError(null);

        // Switch chain if needed
        const currentChainId = parseInt(activeWallet.chainId.split(':')[1] || activeWallet.chainId);
        if (currentChainId !== soneiumMinato.id) {
           await activeWallet.switchChain(soneiumMinato.id);
        }

        const provider = await activeWallet.getEthereumProvider();
        const walletClient = createWalletClient({
          account: activeWallet.address as Address,
          chain: soneiumMinato,
          transport: custom(provider)
        });

        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: GemContract,
          functionName: 'acceptTradeOrder',
          args: [orderId, selectedTokenId],
        });

        setPrivyHash(txHash);
      } catch (err: any) {
        console.error('Error using Privy wallet:', err);
        setPrivyError(err);
      } finally {
        setPrivyIsPending(false);
      }
    } else {
      writeContract({
        address: contractAddress,
        abi: GemContract,
        functionName: 'acceptTradeOrder',
        args: [orderId, selectedTokenId],
      });
    }
  };

  return {
    acceptTradeOrder,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// 取消交易訂單
export function useCancelTradeOrder() {
  const { chainId, activeWallet } = useActiveWallet();
  const contractAddress = chainId
    ? (getContractAddress(chainId) as Address)
    : undefined;

  // Wagmi state
  const { writeContract, data: wagmiHash, error: wagmiError, isPending: wagmiIsPending } = useWriteContract();
  
  // Custom state for Privy interaction
  const [privyHash, setPrivyHash] = useState<Hash | undefined>(undefined);
  const [privyIsPending, setPrivyIsPending] = useState(false);
  const [privyError, setPrivyError] = useState<Error | null>(null);

  const hash = privyHash || wagmiHash;
  const error = privyError || wagmiError;
  const isPending = privyIsPending || wagmiIsPending;

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const cancelTradeOrder = async (orderId: bigint) => {
    if (!contractAddress) return;

    if (activeWallet) {
      try {
        setPrivyIsPending(true);
        setPrivyError(null);

        // Switch chain if needed
        const currentChainId = parseInt(activeWallet.chainId.split(':')[1] || activeWallet.chainId);
        if (currentChainId !== soneiumMinato.id) {
           await activeWallet.switchChain(soneiumMinato.id);
        }

        const provider = await activeWallet.getEthereumProvider();
        const walletClient = createWalletClient({
          account: activeWallet.address as Address,
          chain: soneiumMinato,
          transport: custom(provider)
        });

        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: GemContract,
          functionName: 'cancelTradeOrder',
          args: [orderId],
        });

        setPrivyHash(txHash);
      } catch (err: any) {
        console.error('Error using Privy wallet:', err);
        setPrivyError(err);
      } finally {
        setPrivyIsPending(false);
      }
    } else {
      writeContract({
        address: contractAddress,
        abi: GemContract,
        functionName: 'cancelTradeOrder',
        args: [orderId],
      });
    }
  };

  return {
    cancelTradeOrder,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
