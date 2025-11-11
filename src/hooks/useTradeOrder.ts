import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { GemContract } from '../contracts/abis/index';
import { getContractAddress } from '../contracts/addresses';
import { Address } from 'viem';

// 讀取交易訂單資訊
export function useTradeOrder(orderId: bigint | undefined) {
  const { chainId } = useAccount();
  const contractAddress = chainId ? (getContractAddress(chainId) as Address) : undefined;

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
  const { chainId } = useAccount();
  const contractAddress = chainId ? (getContractAddress(chainId) as Address) : undefined;

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createTradeOrder = (offeredTokenId: bigint, wantedTokenIds: bigint[]) => {
    if (!contractAddress) return;
    
    writeContract({
      address: contractAddress,
      abi: GemContract,
      functionName: 'createTradeOrder',
      args: [offeredTokenId, wantedTokenIds],
    });
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
  const { chainId } = useAccount();
  const contractAddress = chainId ? (getContractAddress(chainId) as Address) : undefined;

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const acceptTradeOrder = (orderId: bigint, selectedTokenId: bigint) => {
    if (!contractAddress) return;
    
    writeContract({
      address: contractAddress,
      abi: GemContract,
      functionName: 'acceptTradeOrder',
      args: [orderId, selectedTokenId],
    });
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
  const { chainId } = useAccount();
  const contractAddress = chainId ? (getContractAddress(chainId) as Address) : undefined;

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const cancelTradeOrder = (orderId: bigint) => {
    if (!contractAddress) return;
    
    writeContract({
      address: contractAddress,
      abi: GemContract,
      functionName: 'cancelTradeOrder',
      args: [orderId],
    });
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

