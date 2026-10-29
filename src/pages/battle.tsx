import { useCallback, useEffect, useRef, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useTranslation } from "react-i18next";
import { useViewportRequirements } from "../context/ViewportRequirementsContext";
import { useCanvasWidth } from "../hooks/useCanvasWidth";
import { useUnityDevicePixelRatio } from "../hooks/useUnityDevicePixelRatio";
import { useRewardAd } from "../hooks/useRewardAd";
import type { RewardAdEventPayload } from "../hooks/useRewardAd";
import { useUser } from "../context/UserContext";
import type { ClaimedReward, StaminaInfo } from "../types/auraServer";
import { FloatingMenuButton } from "../components/FloatingMenuButton";
import { InfoMenuModal } from "../components/InfoMenuModal";
import { ExitGameButton } from "../components/ExitGameButton";
import { useInfoPanelLayout } from "../hooks/useInfoPanelLayout";
import { useUnityBuildVersion } from "../hooks/useUnityBuildVersion";
import type { UnityBuildVersion } from "../hooks/useUnityBuildVersion";
import { useRouter } from "next/router";
import Link from "next/link";
import { useLogin } from "../hooks/useLogin";

type RewardToastData = {
  claimed: ClaimedReward[];
  stamina: StaminaInfo;
};

function RewardToast({ data, onClose }: { data: RewardToastData; onClose: () => void }) {
  const { t } = useTranslation();
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="reward-toast-enter fixed top-6 right-6 z-[70] min-w-[260px] max-w-[320px] bg-zinc-900/95 border border-indigo-400/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl p-5 text-white"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎁</span>
        <h3 className="font-bold text-base tracking-wide">{t("battle.rewardToast.title")}</h3>
      </div>
      {data.claimed.length > 0 ? (
        <ul className="space-y-1.5 mb-3">
          {data.claimed.map((c, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-slate-300">{c.rewardType}</span>
              <span className="font-semibold text-indigo-300">+{c.rewardValue.amount}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400 mb-3">{t("battle.rewardToast.empty")}</p>
      )}
      <div className="pt-3 border-t border-white/10 flex justify-between text-sm">
        <span className="text-slate-400">{t("battle.rewardToast.stamina")}</span>
        <span className="font-semibold text-white">
          {data.stamina.current} / {data.stamina.max}
        </span>
      </div>
    </div>
  );
}

/** 「離開遊戲」的落點：官網的 Aurayale 介紹頁。 */
const EXIT_GAME_ROUTE = "/aurayale";

/**
 * Unity build 載入前的閘門。
 *
 * 先問 /Build/version.json 拿到 buildId，才掛載真正的遊戲元件 —— 因為
 * react-unity-webgl 的 useUnityContext 是用 useRef 在首次 render 就把四個 URL
 * 定住的，mount 之後再改 URL 不會生效。用 key={buildId} 讓 buildId 變動時
 * 整棵子樹重建。
 */
export default function BattlePage() {
  const { t } = useTranslation();
  const { user, ready, authenticated, login, retry, logout, error, isProcessing } = useLogin();

  if (!ready || isProcessing || (authenticated && !user?.token && !error)) {
    return <BattleBackdrop>{t("battle.signingIn")}</BattleBackdrop>;
  }

  if (!user?.token || user.token === "privy-auth-token") {
    return (
      <BattleBackdrop>
        <div className="mx-5 flex max-w-md flex-col items-center gap-5 rounded-2xl border border-white/15 bg-black/65 p-8 text-center backdrop-blur-lg">
          <img src="/img/logo.png" width={220} alt="Aurayale" />
          <h1 className="text-xl">{t("battle.loginTitle")}</h1>
          <p className="text-sm font-normal text-white/75">{t("battle.loginDescription")}</p>
          {error && <p role="alert" className="text-sm font-normal text-red-300">{error}</p>}
          <button type="button" className="rounded-lg bg-indigo-600 px-8 py-3 text-base hover:bg-indigo-500" onClick={authenticated ? retry : login}>
            {t(authenticated ? "battle.retry" : "battle.login")}
          </button>
          {authenticated && <button type="button" className="text-sm font-normal underline" onClick={() => void logout()}>{t("battle.switchAccount")}</button>}
          <Link href={EXIT_GAME_ROUTE} className="text-sm font-normal text-white/65 underline">{t("battle.backToWebsite")}</Link>
        </div>
      </BattleBackdrop>
    );
  }

  // Unmount the entire player on logout/account changes. Reloading the route
  // first restores Privy and exchanges a fresh Aura JWT before downloading Unity.
  return <AuthenticatedBattle key={user.userId} />;
}

function AuthenticatedBattle() {
  const { t } = useTranslation();
  const { status, version, error } = useUnityBuildVersion();

  if (status === "loading") {
    return <BattleBackdrop>{t("battle.loading")}</BattleBackdrop>;
  }

  if (status === "error") {
    // 拿不到 version.json 就無從得知該載哪一版；硬猜只會重蹈版本錯配的覆轍。
    return (
      <BattleBackdrop>
        <span className="text-red-300">{t("battle.versionFailed", { message: error })}</span>
        <button className="mt-5 block text-base underline" onClick={() => window.location.reload()}>{t("battle.retry")}</button>
      </BattleBackdrop>
    );
  }

  return <UnityGame key={version.buildId} version={version} />;
}

/** 遊戲載入 / 錯誤時共用的滿版底圖。 */
function BattleBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        backgroundImage: "url('/img/Aurayale_Bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#1a0a2b",
      }}
    >
      <div
        className="text-white text-2xl font-bold"
        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
      >
        {children}
      </div>
    </div>
  );
}

function UnityGame({ version }: { version: UnityBuildVersion }) {
  const { buildId } = version;
  const { t } = useTranslation();
  const router = useRouter();
  const { unityProvider, isLoaded, loadingProgression, sendMessage, initialisationError } = useUnityContext({
    // 四個檔案都放在 /Build/<buildId>/ 底下，隨每次 build 換一個新目錄。
    // 這是「卡在 90%、清快取才能玩」的解法：檔名固定時，loader / data /
    // framework / wasm 是四個各自過期的快取項目，可能湊出「新 loader + 舊 wasm」，
    // 版本錯配就會在 wasm 實例化時炸掉。換成版本目錄後四者同進同出。
    //
    // 內容是 Brotli，副檔名用中性的 .unityweb，由 vercel.json / next.config.js
    // 送 Content-Encoding: br 讓瀏覽器解壓。
    //
    // framework 檔刻意改名為 Build.framework.unityweb（拿掉中間的 .js）：
    // Vercel 會依副檔名推導 Content-Type，檔名含 .js 會被判為 javascript，
    // 而 javascript 在 CDN 的自動壓縮 MIME 清單內 —— 於是在我們已經是 Brotli
    // 的內容上再壓一層，瀏覽器解一層後仍是壓縮資料，導致 SyntaxError。
    // 同理也不可設 Content-Type: application/wasm（wasm 也在該清單內）。
    // 這些改名由 scripts/deploy-unity-build.mjs 自動處理。
    loaderUrl: `/Build/${buildId}/Build.loader.js`,
    dataUrl: `/Build/${buildId}/Build.data.unityweb`,
    frameworkUrl: `/Build/${buildId}/Build.framework.unityweb`,
    codeUrl: `/Build/${buildId}/Build.wasm.unityweb`,
    streamingAssetsUrl: `/Build/${buildId}/StreamingAssets`,

    // Unity loader 內建的 IndexedDB 快取（webGLDataCaching）用
    // companyName + productName + productVersion 當作 cache 命名空間，並在
    // cleanUpCache() 時清掉 version 不符的舊項目。不帶 productVersion 的話
    // 全部版本共用 "1.0"，舊的 data 檔會一直佔著快取不被淘汰。
    // 帶上 buildId，等於每次新 build 自動汰換掉上一版的快取。
    companyName: "MustaverseDigital",
    productName: "Aurayale",
    productVersion: buildId,
  });

  const { user } = useUser();
  const [rewardToast, setRewardToast] = useState<RewardToastData | null>(null);
  // 初始值 false 以避免 SSR/Hydration mismatch,掛載後再切換為展開狀態
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);
  const infoPanelLayout = useInfoPanelLayout();

  // 桌機(側邊面板模式)預設展開；手機/窄螢幕是全螢幕 Modal，會整片蓋住 Unity canvas，
  // 因此預設關閉，改由浮動按鈕手動開啟。
  // 只在「模式真的切換」時同步一次，避免每次 resize 都覆蓋使用者手動的開關狀態。
  const prevSidePanelRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (prevSidePanelRef.current === infoPanelLayout.isSidePanel) return;
    prevSidePanelRef.current = infoPanelLayout.isSidePanel;
    setIsInfoMenuOpen(infoPanelLayout.isSidePanel);
  }, [infoPanelLayout.isSidePanel]);

  const handleAdResult = (r: RewardAdEventPayload) => {
    switch (r.status) {
      case "viewed":
      case "claimed":
        if (r.claimed && r.stamina) {
          setRewardToast({ claimed: r.claimed, stamina: r.stamina });
        }
        break;
      case "unavailable":
        alert(r.message ?? "adBreak function not found on window");
        break;
      case "error":
        alert(t("battle.rewardClaimFailed", { message: r.message ?? "unknown error" }));
        break;
      case "dismissed":
      case "done":
        break;
    }
  };

  const { showRewardAd, claim: claimReward } = useRewardAd({ sendMessage, onResult: handleAdResult });

  // 「離開遊戲」= 離開 battle 頁，回到官網的 Aurayale 介紹頁。
  const exitToAurayale = useCallback(() => {
    void router.push(EXIT_GAME_ROUTE);
  }, [router]);
  const sentTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    sendMessage("WebBridge", "SetLowMemorySceneTransitions", version.variant === "mobile-astc" ? 1 : 0);
  }, [isLoaded, sendMessage, version.variant]);

  useEffect(() => {
    const w = window as unknown as {
      showRewardAd?: () => void;
      claimReward?: () => void;
    };
    w.showRewardAd = showRewardAd;
    w.claimReward = () => {
      void claimReward();
    };
    return () => {
      if (w.showRewardAd === showRewardAd) delete w.showRewardAd;
      delete w.claimReward;
    };
  }, [showRewardAd, claimReward]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const unityCanvasRef = useRef<HTMLCanvasElement>(null);
  const { viewportHeight, safeAreaInsetBottom } = useViewportRequirements();
  const canvasWidth = useCanvasWidth(viewportHeight);
  const unityDpr = useUnityDevicePixelRatio({
    canvasWidth,
    canvasHeight: viewportHeight,
  });

  // Send the account identity with the JWT. SetPlayerInfoJson triggers the new
  // PlayerSessionService / PostLoginPipeline, which fetches this account's deck.
  // Old localStorage.battleDeck is not authoritative across account switches.
  useEffect(() => {
    if (!isLoaded) return;
    const token = user?.token;
    if (!token || token === "privy-auth-token") return;
    if (sentTokenRef.current === token) return;

    sendMessage("WebBridge", "SetPlayerInfoJson", JSON.stringify({
      playerId: String(user.userId),
      userName: user.name || "",
      walletAddress: user.walletAddress || "",
      token,
    }));
    sentTokenRef.current = token;
  }, [isLoaded, user, sendMessage]);

  // 登出後清除已送出的 token 紀錄，避免下次登入無法重送
  useEffect(() => {
    if (!user?.token) {
      sentTokenRef.current = null;
    }
  }, [user?.token]);

  // Keep a small, privacy-safe breadcrumb that survives a normal tab reload.
  // If iOS kills the whole WebContent process this is not guaranteed to flush,
  // but when it does it distinguishes render-target pressure from app logic.
  useEffect(() => {
    const diagnostic = {
      buildId,
      buildVariant: version.variant,
      textureCompression: version.textureCompression,
      buildSelectionReason: version.selectionReason,
      recordedAt: new Date().toISOString(),
      ...unityDpr,
    };
    console.info("[Aurayale WebGL] render budget", diagnostic);
    try {
      sessionStorage.setItem("aurayale:webgl:last-render-budget", JSON.stringify(diagnostic));
    } catch {
      // Storage can be unavailable in private/restricted browsing modes.
    }
  }, [buildId, unityDpr, version]);

  useEffect(() => {
    const canvas = unityCanvasRef.current;
    if (canvas == null) return;

    const recordContextEvent = (eventName: "webglcontextlost" | "webglcontextrestored") => {
      const diagnostic = {
        event: eventName,
        buildId,
        buildVariant: version.variant,
        textureCompression: version.textureCompression,
        recordedAt: new Date().toISOString(),
        ...unityDpr,
      };
      if (eventName === "webglcontextlost") {
        console.error("[Aurayale WebGL] context lost", diagnostic);
      } else {
        console.info("[Aurayale WebGL] context restored", diagnostic);
      }
      try {
        sessionStorage.setItem("aurayale:webgl:last-context-event", JSON.stringify(diagnostic));
      } catch {
        // Diagnostic storage is best-effort only.
      }
    };

    const onContextLost = () => recordContextEvent("webglcontextlost");
    const onContextRestored = () => recordContextEvent("webglcontextrestored");
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
    };
  }, [buildId, unityDpr, version]);



  // 直式與高度自適應檢查改由全域 OrientationProvider 處理

  // 背景音樂音量
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
    }
  }, []);

  // 用戶任意點擊後觸發 BGM 播放
  useEffect(() => {
    const playBgm = () => {
      if (audioRef.current) {
        audioRef.current.play();
        window.removeEventListener("click", playBgm);
      }
    };
    window.addEventListener("click", playBgm);
    return () => window.removeEventListener("click", playBgm);
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* 背景音樂 */}
      <audio ref={audioRef} src="/bgm/bgm.mp3" autoPlay loop hidden />
      {/* 離開對戰 → 回官網 Aurayale 頁。對戰中可能有進度，先確認再離開。
          桌機側邊面板靠右，不會擋到左上角；只有手機全螢幕 Modal 才需要隱藏。 */}
      <ExitGameButton
        href={EXIT_GAME_ROUTE}
        visible={infoPanelLayout.isSidePanel}
        confirmBeforeExit
      />
      {/* Watch Ad 測試按鈕已隱藏（showRewardAd 仍透過 window.showRewardAd 供 Unity 呼叫） */}
      {/* 獎勵領取通知 */}
      {rewardToast && (
        <RewardToast data={rewardToast} onClose={() => setRewardToast(null)} />
      )}
      {/* Unity WebGL Overlay：僅在符合條件時渲染 */}
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{
          backgroundImage: "url('/img/Aurayale_Bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          backgroundColor: "#1a0a2b",
        }}
      >
        {initialisationError ? (
          <div role="alert" className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 p-6 text-center">
            <p>{t("battle.loadFailed")}</p>
            <button className="rounded-lg bg-indigo-600 px-6 py-3" onClick={() => window.location.reload()}>{t("battle.retry")}</button>
            <Link href={EXIT_GAME_ROUTE} className="underline">{t("battle.backToWebsite")}</Link>
          </div>
        ) : !isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
            <div className="text-white text-2xl font-bold mb-2 flex items-center" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
              <span className="ml-2 animate-bounce">{t("battle.loading")}</span>
            </div>
            <div className="text-white text-lg font-mono tracking-widest animate-pulse" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
              {Math.round(loadingProgression * 100)}%
            </div>
          </div>
        )}
        <Unity
          ref={unityCanvasRef}
          unityProvider={unityProvider}
          className="unity-viewport"
          style={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: `${canvasWidth}px`,
            height: viewportHeight,
            visibility: isLoaded ? "visible" : "hidden",
            display: "block",
            zIndex: 1,
            background: "#000",
            // 確保在不支援 CSS env() 的瀏覽器中有備用值
            marginBottom: safeAreaInsetBottom > 0 ? `${safeAreaInsetBottom}px` : '0',
          }}
          devicePixelRatio={unityDpr.effectiveDevicePixelRatio}
        />
      </div>

      {/* 右下角著作權 */}
      <div
        className="hidden sm:block fixed bottom-2 right-4 z-[55] text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-white/70 pointer-events-none select-none"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
      >
        © 2026 MUSTAVERSE STUDIO. ALL RIGHTS RESERVED.
      </div>

      {/* 桌機版:固定於右側面板中心的 list 按鈕(收合狀態)
          行動裝置 / 窄螢幕:可拖曳的懸浮按鈕。
          InfoMenuModal 開啟時隱藏,避免遮擋。 */}
      <FloatingMenuButton
        onClick={() => setIsInfoMenuOpen(true)}
        visible={!isInfoMenuOpen}
        pinned={
          infoPanelLayout.isSidePanel
            ? {
                left: infoPanelLayout.buttonLeft,
                top: infoPanelLayout.buttonTop,
                size: infoPanelLayout.buttonSize,
              }
            : undefined
        }
      />

      {/* 資訊選單 */}
      <InfoMenuModal
        isOpen={isInfoMenuOpen}
        onClose={() => setIsInfoMenuOpen(false)}
        onExitGame={() => {
          if (!window.confirm(t("exitGame.confirm"))) return;
          setIsInfoMenuOpen(false);
          exitToAurayale();
        }}
      />
    </div>
  );
}
