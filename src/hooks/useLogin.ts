import { useEffect, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/router";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "../context/UserContext";
import { getUserDeck, getUserGems, loginWithPrivy } from "../api/auraServer";

const CONTEST_CHAIN_ID = "bsc-testnet";
export const POST_LOGIN_BATTLE_ROUTE = "/battle";

// Every mounted login control observes the same request, error, and retry state.
// One failed attempt stays failed until an explicit retry (including StrictMode).
const initialState = { isProcessing: false, error: "" };
let state = initialState;
let attemptedAccount: string | null = null;
let generation = 0;
let signingOut = false;
let sessionAccount: string | null = null;
const listeners = new Set<() => void>();
function publish(next: typeof initialState) {
  state = next;
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function resetLogin() {
  generation += 1;
  attemptedAccount = null;
  publish(initialState);
}

interface UseLoginOptions {
  redirectTo?: string | null;
  autoProcess?: boolean;
}

export function useLogin({ redirectTo = null, autoProcess = true }: UseLoginOptions = {}) {
  const router = useRouter();
  const { login: privyLogin, logout: privyLogout, ready, authenticated, user: privyUser, getAccessToken } = usePrivy();
  const { setUser, user } = useUser();
  const { error, isProcessing } = useSyncExternalStore(subscribe, () => state, () => initialState);

  const processLogin = useCallback(async (force = false) => {
    if (!ready || !authenticated || !privyUser || state.isProcessing || signingOut) return;
    if (!force && attemptedAccount === privyUser.id) return;
    attemptedAccount = privyUser.id;
    const requestGeneration = ++generation;
    publish({ isProcessing: true, error: "" });

    try {
      const privyToken = await getAccessToken();
      if (!privyToken) throw new Error("Unable to get your sign-in token. Please sign in again.");
      const response = await loginWithPrivy(privyToken, CONTEST_CHAIN_ID);
      if (!response.token || response.token === "privy-auth-token" || !response.userId) {
        throw new Error("The game server did not return a valid account session.");
      }
      const [gems, deck] = await Promise.all([
        getUserGems(response.token),
        getUserDeck(response.token),
      ]);
      // A logout or account change invalidates all outstanding requests.
      if (generation !== requestGeneration) return;
      sessionAccount = privyUser.id;
      setUser({
        token: response.token,
        userId: response.userId,
        chainId: response.chainId,
        name: response.name,
        walletAddress: response.walletAddress || undefined,
        deck,
        gems,
        loginType: response.loginType,
        email: response.email,
        avatarUrl: response.avatarUrl,
      });
      publish(initialState);
    } catch (cause) {
      if (generation !== requestGeneration) return;
      publish({ isProcessing: false, error: cause instanceof Error ? cause.message : "Login failed" });
    }
  }, [ready, authenticated, privyUser, getAccessToken, setUser]);

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      signingOut = false;
      sessionAccount = null;
      if (attemptedAccount !== null || state.error || state.isProcessing) resetLogin();
      if (user && user.loginType !== "password") setUser(null);
      return;
    }
    if (privyUser && ((sessionAccount && sessionAccount !== privyUser.id) || (attemptedAccount && attemptedAccount !== privyUser.id))) {
      sessionAccount = null;
      resetLogin();
      setUser(null);
      if (autoProcess) void processLogin();
      return;
    }
    if (autoProcess && (!user?.token || user.token === "privy-auth-token")) {
      void processLogin();
    }
  }, [ready, authenticated, privyUser, autoProcess, user, setUser, processLogin]);

  // Redirect belongs to the requesting control, even if another mounted hook
  // completed the shared exchange first.
  useEffect(() => {
    if (redirectTo && user?.token && user.token !== "privy-auth-token") {
      void router.replace(redirectTo);
    }
  }, [redirectTo, user?.token, router]);

  const retry = useCallback(() => { void processLogin(true); }, [processLogin]);
  const login = useCallback(() => {
    if (authenticated) {
      void processLogin(true);
      return;
    }
    resetLogin();
    privyLogin();
  }, [authenticated, processLogin, privyLogin]);
  const logout = useCallback(async () => {
    signingOut = true;
    resetLogin();
    setUser(null);
    localStorage.removeItem("battleDeck");
    try {
      await privyLogout();
    } catch (cause) {
      signingOut = false;
      attemptedAccount = privyUser?.id || null;
      publish({ isProcessing: false, error: cause instanceof Error ? cause.message : "Logout failed" });
    }
  }, [privyLogout, privyUser?.id, setUser]);

  return {
    login, logout, retry, error,
    loading: !ready || isProcessing,
    ready, authenticated, isProcessing, user,
  };
}
