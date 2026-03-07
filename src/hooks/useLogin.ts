import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "../context/UserContext";
import { getUserDeck, getUserGems, loginWithFarcasterByPrivy } from "../api/auraServer";

interface UseLoginOptions {
  redirectTo?: string;
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
      if (privyUser.farcaster) {
        const privyToken = await getAccessToken();
        if (!privyToken) {
          throw new Error("無法獲取 Privy access token");
        }

        const response = await loginWithFarcasterByPrivy(privyToken, "soneium-testnet");

        const [gems, deck] = await Promise.all([
          getUserGems(response.token),
          getUserDeck(response.token),
        ]);

        setUser({
          token: response.token,
          userId: response.userId,
          chainId: response.chainId,
          name: response.name,
          walletAddress: response.walletAddress,
          deck,
          gems,
          loginType: "farcaster",
          farcasterId: response.farcasterId,
          farcasterUsername: response.farcasterUsername,
          farcasterPfpUrl: response.farcasterPfpUrl,
        });
      } else {
        const walletAddress = privyUser.wallet?.address || "";
        const name =
          privyUser.email?.address ||
          (walletAddress ? `${walletAddress.slice(0, 6)}...` : "User");

        setUser({
          token: "privy-auth-token",
          userId: 0,
          name,
          walletAddress,
          deck: [],
          gems: [],
        });
      }

      router.push(redirectTo);
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
