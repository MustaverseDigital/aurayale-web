import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "../context/UserContext";
import { getUserDeck, getUserGems, loginWithPrivy } from "../api/auraServer";

/**
 * 比賽 / 正式流程統一使用的鏈。
 * 需與 AuraServer chain.service.ts 的 DEFAULT_CHAIN_ID 一致。
 */
const CONTEST_CHAIN_ID = "bsc-testnet";

interface UseLoginOptions {
  redirectTo?: string | null;
  autoProcess?: boolean;
}

export function useLogin(options: UseLoginOptions = {}) {
  const { redirectTo = "/platform", autoProcess = true } = options;

  const router = useRouter();
  const { login: privyLogin, logout: privyLogout, ready, authenticated, user: privyUser, getAccessToken } = usePrivy();
  const { setUser, user } = useUser();
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (!user && !authenticated) {
      hasProcessedRef.current = false;
      setIsProcessing(false);
      setError("");
    }
  }, [user, authenticated]);

  useEffect(() => {
    if (!autoProcess) return;
    if (hasProcessedRef.current || (user?.token && user.token !== "privy-auth-token")) {
      return;
    }

    if (ready && authenticated && privyUser && !isProcessing) {
      processLogin();
    }
  }, [ready, authenticated, privyUser, user?.token, autoProcess]);

  const processLogin = useCallback(async () => {
    if (!privyUser) return;

    setIsProcessing(true);
    hasProcessedRef.current = true;
    setError("");

    try {
      // 所有 Privy 登入方式（Google / Farcaster / Email / Wallet）一律走同一條
      // /privy-login 流程並綁定 BSC Testnet。
      //
      // 舊版依登入方式分派不同鏈（Farcaster→soneium、Google→avax-fuji），
      // 且 email-only / wallet-only 會落到 fallback 拿到 placeholder token，
      // 導致那些玩家永遠取不到 Aura JWT、進不了遊戲。統一後一併修正。
      const privyToken = await getAccessToken();
      if (!privyToken) {
        throw new Error("無法獲取 Privy access token");
      }

      const response = await loginWithPrivy(privyToken, CONTEST_CHAIN_ID);

      const [gems, deck] = await Promise.all([
        getUserGems(response.token),
        getUserDeck(response.token),
      ]);

      const isFarcaster = Boolean(privyUser.farcaster);

      setUser({
        token: response.token,
        userId: response.userId,
        chainId: response.chainId,
        name: response.name,
        walletAddress: response.walletAddress || undefined,
        deck,
        gems,
        loginType: isFarcaster ? "farcaster" : "google",
        ...(isFarcaster
          ? {
              farcasterId: response.farcasterId,
              farcasterUsername: response.farcasterUsername,
              farcasterPfpUrl: response.farcasterPfpUrl,
            }
          : {}),
      });

      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (e: any) {
      console.error("Login error:", e);
      setError(e.message || "登入失敗");
      hasProcessedRef.current = false;
    } finally {
      setIsProcessing(false);
    }
  }, [privyUser, getAccessToken, setUser, router, redirectTo]);

  const login = useCallback(() => {
    setError("");
    hasProcessedRef.current = false;
    try {
      privyLogin();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Login failed");
    }
  }, [privyLogin]);

  const logout = useCallback(() => {
    privyLogout();
    setUser(null);
  }, [privyLogout, setUser]);

  const loading = !ready || isProcessing || (authenticated && !user);

  return {
    login,
    logout,
    error,
    loading,
    ready,
    authenticated,
    isProcessing,
    user,
  };
}
