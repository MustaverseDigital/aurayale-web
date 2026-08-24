import { useEffect, useRef, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useTranslation } from "react-i18next";
import { useViewportRequirements } from "../context/ViewportRequirementsContext";
import { useCanvasWidth } from "../hooks/useCanvasWidth";
import { useRewardAd } from "../hooks/useRewardAd";
import type { RewardAdEventPayload } from "../hooks/useRewardAd";
import { useUser } from "../context/UserContext";
import type { ClaimedReward, StaminaInfo } from "../types/auraServer";
import { FloatingMenuButton } from "../components/FloatingMenuButton";
import { InfoMenuModal } from "../components/InfoMenuModal";
import { ExitGameButton } from "../components/ExitGameButton";
import { useInfoPanelLayout } from "../hooks/useInfoPanelLayout";

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

export default function BattlePage() {
  const { t } = useTranslation();
  const [pendingDeck, setPendingDeck] = useState<string | null>(null);
  const { unityProvider, isLoaded, loadingProgression, sendMessage } = useUnityContext({
    loaderUrl: "/Build/Build.loader.js",
    dataUrl: "/Build/Build.data.unityweb",
    frameworkUrl: "/Build/Build.framework.js.unityweb",
    codeUrl: "/Build/Build.wasm.unityweb",
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
  const sentTokenRef = useRef<string | null>(null);

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
  // devicePixelRatio 狀態初始化
  const [devicePixelRatio, setDevicePixelRatio] = useState(
    typeof window !== "undefined" ? window.devicePixelRatio : 1
  );
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isAllowed, viewportHeight, safeAreaInsetBottom } = useViewportRequirements();
  const canvasWidth = useCanvasWidth(viewportHeight);

  // 取得 battleDeck
  //
  // 來源有兩個，優先序如下：
  //   1. localStorage.battleDeck —— 從 platform 頁按 Battle 進來時設定的
  //   2. UserContext 的 deck —— 登入時 useLogin 已抓過 GET /user/gem-deck
  //
  // 第 2 個是為了「登入後直接進 /battle」的流程：不經過 platform 就沒有
  // localStorage，少了 fallback 會完全不送牌組給 Unity。
  useEffect(() => {
    const stored = localStorage.getItem("battleDeck");
    if (stored) {
      setPendingDeck(stored);
      return;
    }
    if (user?.deck && user.deck.length > 0) {
      setPendingDeck(JSON.stringify(user.deck));
    }
  }, [user?.deck]);

  // Unity 載入完成後傳送 deck
  useEffect(() => {
    if (isLoaded && pendingDeck) {
      sendMessage("WebBridge", "SetCardDeck", pendingDeck);
      setPendingDeck(null);
    }
  }, [isLoaded, pendingDeck, sendMessage]);

  // Unity 載入完成後傳送 JWT token
  // 僅傳送後端核發的 token，忽略未完成登入流程的 placeholder
  useEffect(() => {
    if (!isLoaded) return;
    const token = user?.token;
    if (!token || token === "privy-auth-token") return;
    if (sentTokenRef.current === token) return;

    sendMessage("WebBridge", "SetAuthToken", token);
    sentTokenRef.current = token;
  }, [isLoaded, user?.token, sendMessage]);

  // 登出後清除已送出的 token 紀錄，避免下次登入無法重送
  useEffect(() => {
    if (!user?.token) {
      sentTokenRef.current = null;
    }
  }, [user?.token]);

  // 動態追蹤 devicePixelRatio
  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateDevicePixelRatio = () => setDevicePixelRatio(window.devicePixelRatio);
      updateDevicePixelRatio();
      const mediaMatcher = window.matchMedia(`screen and (resolution: ${window.devicePixelRatio}dppx)`);
      mediaMatcher.addEventListener("change", updateDevicePixelRatio);
      return () => {
        mediaMatcher.removeEventListener("change", updateDevicePixelRatio);
      };
    }
  }, [devicePixelRatio]);



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
      {/* 離開對戰 → 回牌組頁。對戰中可能有進度，先確認再離開。
          桌機側邊面板靠右，不會擋到左上角；只有手機全螢幕 Modal 才需要隱藏。 */}
      <ExitGameButton
        href="/platform"
        visible={infoPanelLayout.isSidePanel || !isInfoMenuOpen}
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
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
            <div className="text-white text-2xl font-bold mb-2 flex items-center" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
              <span className="ml-2 animate-bounce">Loading Game...</span>
            </div>
            <div className="text-white text-lg font-mono tracking-widest animate-pulse" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
              {Math.round(loadingProgression * 100)}%
            </div>
          </div>
        )}
        <Unity
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
          devicePixelRatio={devicePixelRatio}
        />
      </div>

      {/* 右下角著作權 */}
      <div
        className="fixed bottom-2 right-4 z-[55] text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-white/70 pointer-events-none select-none"
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
      />
    </div>
  );
} 