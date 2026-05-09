import { useEffect, useRef, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useViewportRequirements } from "../context/ViewportRequirementsContext";
import { useCanvasWidth } from "../hooks/useCanvasWidth";
import { useRewardAd } from "../hooks/useRewardAd";
import type { RewardAdEventPayload } from "../hooks/useRewardAd";
import { useUser } from "../context/UserContext";
import type { ClaimedReward, StaminaInfo } from "../types/auraServer";
import { FloatingMenuButton } from "../components/FloatingMenuButton";
import { InfoMenuModal } from "../components/InfoMenuModal";

type RewardToastData = {
  claimed: ClaimedReward[];
  stamina: StaminaInfo;
};

function RewardToast({ data, onClose }: { data: RewardToastData; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="reward-toast-enter fixed top-6 right-6 z-[70] min-w-[260px] max-w-[320px] bg-zinc-900/95 border border-indigo-400/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl p-5 text-white"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎁</span>
        <h3 className="font-bold text-base tracking-wide">獎勵已領取</h3>
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
        <p className="text-sm text-slate-400 mb-3">無獎勵項目</p>
      )}
      <div className="pt-3 border-t border-white/10 flex justify-between text-sm">
        <span className="text-slate-400">體力</span>
        <span className="font-semibold text-white">
          {data.stamina.current} / {data.stamina.max}
        </span>
      </div>
    </div>
  );
}

export default function BattlePage() {
  const [pendingDeck, setPendingDeck] = useState<string | null>(null);
  const { unityProvider, isLoaded, loadingProgression, sendMessage } = useUnityContext({
    loaderUrl: "/Build/Build.loader.js",
    dataUrl: "/Build/Build.data.unityweb",
    frameworkUrl: "/Build/Build.framework.js.unityweb",
    codeUrl: "/Build/Build.wasm.unityweb",
  });

  const { user } = useUser();
  const [rewardToast, setRewardToast] = useState<RewardToastData | null>(null);
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);

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
        alert(`領獎流程失敗: ${r.message ?? "unknown error"}`);
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
  useEffect(() => {
    const deck = localStorage.getItem("battleDeck");
    if (deck) setPendingDeck(deck);
  }, []);

  // Unity 載入完成後傳送 deck
  useEffect(() => {
    if (isLoaded && pendingDeck) {
      sendMessage("Web", "SetCardDeck", pendingDeck);
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
      {/* Watch Ad 測試按鈕（overlay 在 Unity 之上） */}
      <button
        type="button"
        onClick={() => showRewardAd()}
        className="fixed bottom-6 right-6 z-[60] px-5 py-3 bg-primary/90 hover:bg-indigo-500 text-white font-bold text-sm uppercase tracking-widest rounded-xl shadow-[0_10px_30px_rgba(99,102,241,0.4)] backdrop-blur transition-all"
      >
        Watch Ad
      </button>
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

      {/* 右側可拖曳懸浮選單按鈕(InfoMenuModal 開啟時隱藏避免遮擋) */}
      <FloatingMenuButton
        onClick={() => setIsInfoMenuOpen(true)}
        visible={!isInfoMenuOpen}
      />

      {/* 資訊選單 */}
      <InfoMenuModal
        isOpen={isInfoMenuOpen}
        onClose={() => setIsInfoMenuOpen(false)}
      />
    </div>
  );
} 