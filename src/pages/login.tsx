import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import LoginComponent from "../components/LoginComponent";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "../context/UserContext";
import { getUserDeck, getUserGems, loginWithFarcasterByPrivy } from "../api/auraServer";
export default function LoginPage() {
  const router = useRouter();
  const { login, ready, authenticated, user: privyUser, getAccessToken } = usePrivy();
  const { setUser, user } = useUser();
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessedRef = useRef(false); // 追蹤是否已經處理過登入

  // Handle successful login
  useEffect(() => {
    // 如果已經處理過，或者已經有有效的 token，就不需要再處理
    if (hasProcessedRef.current || (user?.token && user.token !== "privy-auth-token")) {
      return;
    }

    if (ready && authenticated && privyUser && !isProcessing) {
      const handleLogin = async () => {
        setIsProcessing(true);
        hasProcessedRef.current = true; // 標記為已處理
        setError("");

        try {
          // 檢查是否是 Farcaster 登入
          if (privyUser.farcaster) {
            // Farcaster 登入流程
            const privyToken = await getAccessToken();

            if (!privyToken) {
              throw new Error("無法獲取 Privy access token");
            }

            // 調用後端 API 進行 Farcaster 登入
            const response = await loginWithFarcasterByPrivy(privyToken, 'soneium-testnet');

            // 獲取用戶的寶石和牌組資料
            const [gems, deck] = await Promise.all([
              getUserGems(response.token),
              getUserDeck(response.token),
            ]);

            // 存入 UserContext
            setUser({
              token: response.token,
              userId: response.userId,
              chainId: response.chainId,
              name: response.name,
              walletAddress: response.walletAddress,
              deck: deck,
              gems: gems,
              loginType: 'farcaster',
              farcasterId: response.farcasterId,
              farcasterUsername: response.farcasterUsername,
              farcasterPfpUrl: response.farcasterPfpUrl,
            });

            router.push("/platform");
          } else {
            // 非 Farcaster 登入，保持原有邏輯
            const walletAddress = privyUser.wallet?.address || "";
            const name = privyUser.email?.address || (walletAddress ? `${walletAddress.slice(0, 6)}...` : "User");

            setUser({
              token: "privy-auth-token",
              userId: 0,
              name: name,
              walletAddress: walletAddress,
              deck: [],
              gems: []
            });

            router.push("/platform");
          }
        } catch (e: any) {
          console.error("Login error:", e);
          setError(e.message || "登入失敗");
          hasProcessedRef.current = false; // 發生錯誤時重置，允許重試
        } finally {
          setIsProcessing(false);
        }
      };

      handleLogin();
    }
  }, [ready, authenticated, privyUser, router, setUser, getAccessToken, user?.token]); // 移除 isProcessing，加入 user?.token

  const handleLogin = () => {
    setError("");
    hasProcessedRef.current = false; // 重置處理標記，允許重新登入
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
      loading={!ready || authenticated || isProcessing} // Show loading if not ready, already authenticated, or processing
      error={error}
      onLogin={handleLogin}
    />
  );
}