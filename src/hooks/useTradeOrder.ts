import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { GemContract } from '../contracts/abis/index';
import { getContractAddress } from '../contracts/addresses';
import { Address, type Abi } from 'viem';
import { isSoneiumTestnet } from '../lib/chainUtils';
import {
  usePrivyReadContract,
  usePrivyWriteContract,
} from './usePrivyContract';

// 讀取交易訂單資訊
export function useTradeOrder(orderId: bigint | undefined) {
  const { chainId } = useAccount();
  const contractAddress = chainId
    ? (getContractAddress(chainId) as Address)
    : undefined;

  const useSoneium = isSoneiumTestnet(chainId);

  // 使用 Privy 讀取（soneium-testnet）
  const privyRead = usePrivyReadContract({
    address: contractAddress,
    abi: GemContract as Abi,
    functionName: 'getTradeOrder',
    args: orderId !== undefined ? [orderId] : undefined,
    enabled: useSoneium && !!orderId && !!contractAddress,
  });

  // 使用 Wagmi 讀取（其他鏈）
  const wagmiRead = useReadContract({
    address: contractAddress,
    abi: GemContract,
    functionName: 'getTradeOrder',
    args: orderId !== undefined ? [orderId] : undefined,
    query: {
      enabled: !useSoneium && !!orderId && !!contractAddress,
    },
  });

  // 根據鏈選擇返回對應的結果
  return useSoneium ? privyRead : wagmiRead;
}

// 建立交易訂單
export function useCreateTradeOrder() {
  const { chainId } = useAccount();
  const contractAddress = chainId
    ? (getContractAddress(chainId) as Address)
    : undefined;

  const useSoneium = isSoneiumTestnet(chainId);

  // 使用 Privy 寫入（soneium-testnet）
  const privyWrite = usePrivyWriteContract();

  // 使用 Wagmi 寫入（其他鏈）
  const {
    writeContract: wagmiWriteContract,
    data: wagmiHash,
    error: wagmiError,
    isPending: wagmiIsPending,
  } = useWriteContract();
  const { isLoading: wagmiIsConfirming, isSuccess: wagmiIsSuccess } =
    useWaitForTransactionReceipt({
      hash: wagmiHash,
    });

  const createTradeOrder = (
    offeredTokenId: bigint,
    wantedTokenIds: bigint[]
  ) => {
    if (!contractAddress) return;

    if (useSoneium) {
      // 使用 Privy
      privyWrite.writeContract({
        address: contractAddress,
        abi: GemContract as Abi,
        functionName: 'createTradeOrder',
        args: [offeredTokenId, wantedTokenIds],
      });
    } else {
      // 使用 Wagmi
      wagmiWriteContract({
        address: contractAddress,
        abi: GemContract as Abi,
        functionName: 'createTradeOrder',
        args: [offeredTokenId, wantedTokenIds],
      });
    }
  };

  // 根據鏈選擇返回對應的結果
  if (useSoneium) {
    return {
      createTradeOrder,
      hash: privyWrite.hash,
      isPending: privyWrite.isPending,
      isConfirming: privyWrite.isConfirming,
      isSuccess: privyWrite.isSuccess,
      error: privyWrite.error,
    };
  } else {
    return {
      createTradeOrder,
      hash: wagmiHash,
      isPending: wagmiIsPending,
      isConfirming: wagmiIsConfirming,
      isSuccess: wagmiIsSuccess,
      error: wagmiError,
    };
  }
}

// 接受交易訂單
export function useAcceptTradeOrder() {
  const { chainId } = useAccount();
  const contractAddress = chainId
    ? (getContractAddress(chainId) as Address)
    : undefined;

  const useSoneium = isSoneiumTestnet(chainId);

  // 使用 Privy 寫入（soneium-testnet）
  const privyWrite = usePrivyWriteContract();

  // 使用 Wagmi 寫入（其他鏈）
  const {
    writeContract: wagmiWriteContract,
    data: wagmiHash,
    error: wagmiError,
    isPending: wagmiIsPending,
  } = useWriteContract();
  const { isLoading: wagmiIsConfirming, isSuccess: wagmiIsSuccess } =
    useWaitForTransactionReceipt({
      hash: wagmiHash,
    });

  const acceptTradeOrder = (orderId: bigint, selectedTokenId: bigint) => {
    if (!contractAddress) return;

    if (useSoneium) {
      // 使用 Privy
      privyWrite.writeContract({
        address: contractAddress,
        abi: GemContract as Abi,
        functionName: 'acceptTradeOrder',
        args: [orderId, selectedTokenId],
      });
    } else {
      // 使用 Wagmi
      wagmiWriteContract({
        address: contractAddress,
        abi: GemContract as Abi,
        functionName: 'acceptTradeOrder',
        args: [orderId, selectedTokenId],
      });
    }
  };

  // 根據鏈選擇返回對應的結果
  if (useSoneium) {
    return {
      acceptTradeOrder,
      hash: privyWrite.hash,
      isPending: privyWrite.isPending,
      isConfirming: privyWrite.isConfirming,
      isSuccess: privyWrite.isSuccess,
      error: privyWrite.error,
    };
  } else {
    return {
      acceptTradeOrder,
      hash: wagmiHash,
      isPending: wagmiIsPending,
      isConfirming: wagmiIsConfirming,
      isSuccess: wagmiIsSuccess,
      error: wagmiError,
    };
  }
}

// 取消交易訂單
export function useCancelTradeOrder() {
  const { chainId } = useAccount();
  const contractAddress = chainId
    ? (getContractAddress(chainId) as Address)
    : undefined;

  const useSoneium = isSoneiumTestnet(chainId);

  // 使用 Privy 寫入（soneium-testnet）
  const privyWrite = usePrivyWriteContract();

  // 使用 Wagmi 寫入（其他鏈）
  const {
    writeContract: wagmiWriteContract,
    data: wagmiHash,
    error: wagmiError,
    isPending: wagmiIsPending,
  } = useWriteContract();
  const { isLoading: wagmiIsConfirming, isSuccess: wagmiIsSuccess } =
    useWaitForTransactionReceipt({
      hash: wagmiHash,
    });

  const cancelTradeOrder = (orderId: bigint) => {
    if (!contractAddress) return;

    if (useSoneium) {
      // 使用 Privy
      privyWrite.writeContract({
        address: contractAddress,
        abi: GemContract as Abi,
        functionName: 'cancelTradeOrder',
        args: [orderId],
      });
    } else {
      // 使用 Wagmi
      wagmiWriteContract({
        address: contractAddress,
        abi: GemContract as Abi,
        functionName: 'cancelTradeOrder',
        args: [orderId],
      });
    }
  };

  // 根據鏈選擇返回對應的結果
  if (useSoneium) {
    return {
      cancelTradeOrder,
      hash: privyWrite.hash,
      isPending: privyWrite.isPending,
      isConfirming: privyWrite.isConfirming,
      isSuccess: privyWrite.isSuccess,
      error: privyWrite.error,
    };
  } else {
    return {
      cancelTradeOrder,
      hash: wagmiHash,
      isPending: wagmiIsPending,
      isConfirming: wagmiIsConfirming,
      isSuccess: wagmiIsSuccess,
      error: wagmiError,
    };
  }
}
