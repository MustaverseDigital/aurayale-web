import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "../context/UserContext";
import { getUserDeck, getUserGems, loginWithPrivy } from "../api/auraServer";

/**
 * 比賽 / 正式流程統一使用的鏈。
 * 需與 AuraServer chain.service.ts 的 DEFAULT_CHAIN_ID 一致。
 */
const CONTEST_CHAIN_ID = "bsc-testnet";

/**
 * 登入後若要跳轉，慣例上的落點。
 *
 * Unity 端在收到 SetAuthToken 後會自行跑 DeckSyncStep（GET /user/gem-deck）
 * 並套用牌組，不需要網頁先經 platform 準備 localStorage.battleDeck。
 *
 * 注意：這不再是 useLogin 的預設值。跳轉需由呼叫端明確傳入
 * `useLogin({ redirectTo: POST_LOGIN_BATTLE_ROUTE })` 才會發生，
 * 避免多個 useLogin 實例同時掛載時互搶跳轉。
 */
export const POST_LOGIN_BATTLE_ROUTE = "/battle";

/**
 * 登入流程的模組層級狀態。
 *
 * useLogin 會被多個元件同時掛載（例如 /aurayale 就同時有頁面本身、
 * LandingNavbar、MobileMenu 三個 autoProcess:true 的實例）。若把「是否已處理」
 * 放在各自的 useRef，三個實例會各自判定「我還沒跑過」而同時呼叫 processLogin：
 *   - 對 Privy /v1/users/me 併發三次 → 觸發 429
 *   - 三個實例各自 router.push(redirectTo) → 跳轉互相打架
 *
 * 改用模組層級旗標，確保同一次登入全域只跑一次。
 */
let loginInFlight = false;
let loginCompleted = false;

/** Privy 登出／session 失效時重置，讓下一次登入可以重新開始。 */
function resetLoginGuard() {
  loginInFlight = false;
  loginCompleted = false;
}

interface UseLoginOptions {
  redirectTo?: string | null;
  autoProcess?: boolean;
}

export function useLogin(options: UseLoginOptions = {}) {
  // 預設不跳轉：登入只負責取得 Aura token / 牌組，換頁由呼叫端明確指定。
  const { redirectTo = null, autoProcess = true } = options;

  const router = useRouter();
  const { login: privyLogin, logout: privyLogout, ready, authenticated, user: privyUser, getAccessToken } = usePrivy();
  const { setUser, user } = useUser();
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user && !authenticated) {
      resetLoginGuard();
      setIsProcessing(false);
      setError("");
    }
  }, [user, authenticated]);

  const processLogin = useCallback(async () => {
    if (!privyUser) return;
    if (loginInFlight || loginCompleted) return;

    loginInFlight = true;
    setIsProcessing(true);
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

      // loginType 由後端依 Privy 的 linked_accounts 判定（google / email / wallet）。
      // 先前是用 privyUser.farcaster 推導，但 Privy 的 loginMethods 未啟用
      // Farcaster，該判斷恆為 false，等於永遠回報 "google"。
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

      loginCompleted = true;

      // 登入成功後「不」自動跳頁。
      //
      // 先前多個 useLogin 實例會各自 router.push(redirectTo)，造成跳轉互搶；
      // 加上失敗重試迴圈，導致跳轉行為不可預期。改為只負責把 Aura token 與
      // 牌組寫進 UserContext，實際要不要換頁、換到哪一頁交由呼叫端決定
      // （傳入 redirectTo 時才會跳，預設為 null）。
      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (e: any) {
      console.error("Login error:", e);
      setError(e.message || "登入失敗");
      // 這裡刻意「不」重置 loginCompleted 以外的旗標來自動重跑。
      //
      // 若在此重新開放自動流程，上方的 autoProcess effect 會立刻再次符合
      // 觸發條件（ready/authenticated/privyUser 都沒變），形成無限重試迴圈：
      // 每一輪都打一次 Privy /v1/users/me，很快就被判定濫用而回 429
      // （表面錯誤訊息是 "Failed to verify Privy token: ... status code 429"）。
      //
      // 失敗後改由使用者手動按 retry()／login() 重新開始，避免自動重打。
    } finally {
      loginInFlight = false;
      setIsProcessing(false);
    }
  }, [privyUser, getAccessToken, setUser, router, redirectTo]);

  useEffect(() => {
    if (!autoProcess) return;
    // loginInFlight / loginCompleted 是模組層級的，跨實例共用，
    // 因此多個 useLogin 同時掛載時只有第一個會真的進到 processLogin。
    if (loginInFlight || loginCompleted) return;
    if (user?.token && user.token !== "privy-auth-token") return;

    if (ready && authenticated && privyUser) {
      processLogin();
    }
  }, [ready, authenticated, privyUser, user?.token, autoProcess, processLogin]);

  /** 手動重試登入。自動流程失敗後不會自己重跑，需由 UI 呼叫這支。 */
  const retry = useCallback(() => {
    setError("");
    resetLoginGuard();
    setIsProcessing(false);
  }, []);

  const login = useCallback(() => {
    setError("");
    resetLoginGuard();
    try {
      privyLogin();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Login failed");
    }
  }, [privyLogin]);

  const logout = useCallback(() => {
    resetLoginGuard();
    privyLogout();
    setUser(null);
  }, [privyLogout, setUser]);

  const loading = !ready || isProcessing || (authenticated && !user);

  return {
    login,
    logout,
    retry,
    error,
    loading,
    ready,
    authenticated,
    isProcessing,
    user,
  };
}
