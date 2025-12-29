import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import LoginComponent from "../components/LoginComponent";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount, useSignMessage } from "wagmi";
import { useUser } from "../context/UserContext";
import { loginWithFarcaster } from "../api/auraServer";
import { generateFarcasterMessage } from "../lib/farcaster";

export default function LoginPage() {
  const router = useRouter();
  const { login, ready, authenticated, user: privyUser } = usePrivy();
  const { wallets } = useWallets();
  const { address: connectedAddress, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { setUser, user } = useUser();
  const [error, setError] = useState("");
  const [isProcessingFarcaster, setIsProcessingFarcaster] = useState(false);
  const hasProcessedFarcaster = useRef(false);

  // Handle Farcaster login
  useEffect(() => {
    if (
      ready &&
      authenticated &&
      privyUser &&
      privyUser.farcaster &&
      !hasProcessedFarcaster.current &&
      !isProcessingFarcaster &&
      !user?.token
    ) {
      hasProcessedFarcaster.current = true;
      handleFarcasterLogin();
    }
  }, [ready, authenticated, privyUser, isProcessingFarcaster, user]);

  const handleFarcasterLogin = async () => {
    if (!privyUser?.farcaster) return;

    setIsProcessingFarcaster(true);
    setError("");

    try {
      // 獲取錢包地址（優先使用連接的錢包，否則使用 Privy wallet）
      const walletAddress =
        connectedAddress ||
        wallets.find((w) => w.walletClientType !== "privy")?.address ||
        privyUser.wallet?.address;

      if (!walletAddress) {
        throw new Error("請先連接錢包");
      }

      // 確保錢包已連接
      if (!isConnected && !wallets.some((w) => w.address === walletAddress)) {
        throw new Error("請先連接錢包");
      }

      // 獲取 Farcaster ID
      const farcasterId = privyUser.farcaster.fid
        ? String(privyUser.farcaster.fid)
        : undefined;

      // 生成簽名消息
      const message = generateFarcasterMessage(walletAddress, farcasterId);

      // 簽名消息
      let signature: string;
      try {
        const sig = await signMessageAsync({ message });
        signature = sig;
      } catch (signError: any) {
        throw new Error(
          signError.message || "簽名失敗，請確認錢包連接狀態"
        );
      }

      // 調用 Farcaster 登入 API（預設使用 soneium-testnet）
      const response = await loginWithFarcaster(walletAddress, signature, {
        farcasterId,
        chain_id: "soneium-testnet",
      });

      // 更新 UserContext
      setUser({
        token: response.token,
        userId: response.userId,
        chainId: response.chainId,
        name: response.name,
        walletAddress: response.walletAddress,
        loginType: "farcaster",
        farcasterId: response.farcasterId,
        deck: [],
        gems: [],
      });

      // 重定向到平台
      router.push("/platform");
    } catch (e: any) {
      console.error("Farcaster login error:", e);
      setError(e.message || "Farcaster 登入失敗");
      hasProcessedFarcaster.current = false; // 允許重試
    } finally {
      setIsProcessingFarcaster(false);
    }
  };

  // Handle successful login (non-Farcaster)
  useEffect(() => {
    if (
      ready &&
      authenticated &&
      privyUser &&
      !privyUser.farcaster &&
      !user?.token &&
      !isProcessingFarcaster
    ) {
      // User is logged in via Privy (non-Farcaster)
      // We set the user context with available info.
      const walletAddress = privyUser.wallet?.address || "";
      const name =
        privyUser.email?.address ||
        privyUser.google?.email ||
        (walletAddress ? `${walletAddress.slice(0, 6)}...` : "User");

      setUser({
        token: "privy-auth-token",
        userId: 0,
        name: name,
        walletAddress: walletAddress,
        deck: [],
        gems: [],
      });

      router.push("/platform");
    }
  }, [
    ready,
    authenticated,
    privyUser,
    router,
    setUser,
    user,
    isProcessingFarcaster,
  ]);

  const handleLogin = () => {
    setError("");
    // Use Privy's general login modal which allows email/wallet
    try {
      login();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Login failed");
    }
  };

  return (
    <LoginComponent
      loading={
        !ready ||
        authenticated ||
        isProcessingFarcaster ||
        (authenticated && privyUser?.farcaster && !user?.token)
      } // Show loading if not ready or already authenticated (redirecting) or processing Farcaster login
      error={error}
      onLogin={handleLogin}
    />
  );
}
