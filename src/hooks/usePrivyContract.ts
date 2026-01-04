import { useState, useEffect, useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
  type Abi,
} from 'viem';
import { soneiumMinato } from '../wagmi';

/**
 * 使用 Privy wallet 讀取合約資料
 */
export function usePrivyReadContract<T = any>(config: {
  address: Address | undefined;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
  enabled?: boolean;
}) {
  const { wallets } = useWallets();
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 找到 privy embedded wallet
  const privyWallet = wallets.find((w) => w.walletClientType === 'privy');

  const readContract = useCallback(async () => {
    if (!config.enabled || !config.address) {
      setData(undefined);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 創建 public client（讀取操作不需要 provider）
      const publicClient = createPublicClient({
        chain: soneiumMinato,
        transport: http(),
      });

      // 讀取合約
      const result = await publicClient.readContract({
        address: config.address,
        abi: config.abi,
        functionName: config.functionName as any,
        args: config.args,
      });

      setData(result as T);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [
    config.address,
    config.abi,
    config.functionName,
    config.args,
    config.enabled,
  ]);

  useEffect(() => {
    readContract();
  }, [readContract]);

  return {
    data,
    isLoading,
    error,
    refetch: readContract,
  };
}

/**
 * 使用 Privy wallet 寫入合約（發送交易）
 */
export function usePrivyWriteContract() {
  const { wallets } = useWallets();
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 找到 privy embedded wallet
  const privyWallet = wallets.find((w) => w.walletClientType === 'privy');

  const writeContract = useCallback(
    async (config: {
      address: Address;
      abi: Abi;
      functionName: string;
      args?: readonly unknown[];
    }) => {
      if (!privyWallet) {
        setError(new Error('Privy wallet 未連接'));
        return;
      }

      try {
        setIsPending(true);
        setError(null);
        setIsSuccess(false);
        setIsConfirming(false);

        // 獲取 provider
        const provider = await privyWallet.getEthereumProvider();
        if (!provider) {
          throw new Error('無法獲取 Privy provider');
        }

        // 創建 wallet client，使用 privy wallet 的 provider
        const walletClient = createWalletClient({
          chain: soneiumMinato,
          transport: custom(provider),
          account: privyWallet.address as Address,
        });

        // 寫入合約（發送交易）
        const txHash = await walletClient.writeContract({
          address: config.address,
          abi: config.abi,
          functionName: config.functionName as any,
          args: config.args,
        });

        setHash(txHash);
        setIsPending(false);
        setIsConfirming(true);

        // 等待交易確認
        const publicClient = createPublicClient({
          chain: soneiumMinato,
          transport: http(),
        });

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        if (receipt.status === 'success') {
          setIsSuccess(true);
        } else {
          throw new Error('交易失敗');
        }
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsSuccess(false);
      } finally {
        setIsPending(false);
        setIsConfirming(false);
      }
    },
    [privyWallet]
  );

  return {
    writeContract,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
