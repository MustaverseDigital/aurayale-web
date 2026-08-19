import { useEffect, useRef, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useViewportRequirements } from "../context/ViewportRequirementsContext";
import { useCanvasWidth } from "../hooks/useCanvasWidth";
import { FloatingMenuButton } from "../components/FloatingMenuButton";
import { InfoMenuModal } from "../components/InfoMenuModal";
import { ExitGameButton } from "../components/ExitGameButton";
import { useInfoPanelLayout } from "../hooks/useInfoPanelLayout";

/**
 * Demo / Exhibition page (/demo)
 *
 * 與正常版 /battle 的區隔：
 * - 載入「展覽版」Unity build（/demo/Build.*），與正常 build (/Build/) 完全分離 →
 *   展覽功能（無限體力、運營面板）只在這個 build 裡，正式 build 連程式碼都沒有。
 * - 不需登入：展覽版無後端、不傳 JWT / 牌組，玩家直接試玩完整體驗。
 * - 不傳 SetAuthToken / SetCardDeck：展覽 build 自己用全卡池與 ExhibitionConfig，
 *   不依賴 React 推資料。
 * - 保留資訊面板（InfoMenuModal）：教學 / 寶石圖鑑等說明圖，與 /battle 一致，
 *   讓展場玩家也能看到玩法教學。
 */
export default function DemoPage() {
  const { unityProvider, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "/demo/Build.loader.js",
    dataUrl: "/demo/Build.data.unityweb",
    frameworkUrl: "/demo/Build.framework.js.unityweb",
    codeUrl: "/demo/Build.wasm.unityweb",
  });

  const [devicePixelRatio, setDevicePixelRatio] = useState(
    typeof window !== "undefined" ? window.devicePixelRatio : 1
  );
  const audioRef = useRef<HTMLAudioElement>(null);
  const { viewportHeight, safeAreaInsetBottom } = useViewportRequirements();
  const canvasWidth = useCanvasWidth(viewportHeight);

  // 資訊面板（教學 / 寶石圖鑑）— 與 /battle 相同
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);
  const infoPanelLayout = useInfoPanelLayout();

  // 展場為直式螢幕，資訊面板在窄畫面是全螢幕 Modal（fixed inset-0 z-[75]），
  // 會整片蓋住 z-index 1 的 Unity canvas，看起來像載入完就卡死。
  // 桌機(側邊面板模式)才預設展開；直式螢幕預設關閉，由浮動按鈕手動開啟。
  // 只在「模式真的切換」時同步一次，避免每次 resize 都覆蓋使用者手動的開關狀態。
  const prevSidePanelRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (prevSidePanelRef.current === infoPanelLayout.isSidePanel) return;
    prevSidePanelRef.current = infoPanelLayout.isSidePanel;
    setIsInfoMenuOpen(infoPanelLayout.isSidePanel);
  }, [infoPanelLayout.isSidePanel]);

  // 動態追蹤 devicePixelRatio
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setDevicePixelRatio(window.devicePixelRatio);
    update();
    const mediaMatcher = window.matchMedia(
      `screen and (resolution: ${window.devicePixelRatio}dppx)`
    );
    mediaMatcher.addEventListener("change", update);
    return () => mediaMatcher.removeEventListener("change", update);
  }, [devicePixelRatio]);

  // 背景音樂音量
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.2;
  }, []);

  // 用戶任意點擊後觸發 BGM 播放
  useEffect(() => {
    const playBgm = () => {
      if (audioRef.current) {
        void audioRef.current.play();
        window.removeEventListener("click", playBgm);
      }
    };
    window.addEventListener("click", playBgm);
    return () => window.removeEventListener("click", playBgm);
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col">
      <audio ref={audioRef} src="/bgm/bgm.mp3" autoPlay loop hidden />

      {/* 離開遊戲 → 回官網。展場版無進度可失，不需二次確認。
          桌機側邊面板靠右，不會擋到左上角；只有手機全螢幕 Modal 才需要隱藏。 */}
      <ExitGameButton
        href="/landing"
        visible={infoPanelLayout.isSidePanel || !isInfoMenuOpen}
      />

      {/* 展覽模式標記（移到右上角，避免與左上角的離開按鈕重疊） */}
      <div className="fixed top-3 right-3 z-[60] text-[10px] font-bold uppercase tracking-[0.15em] text-amber-300/80 pointer-events-none select-none">
        DEMO / EXHIBITION
      </div>

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
            <div
              className="text-white text-2xl font-bold mb-2 flex items-center"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
            >
              <span className="ml-2 animate-bounce">Loading Demo...</span>
            </div>
            <div
              className="text-white text-lg font-mono tracking-widest animate-pulse"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
            >
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
            marginBottom: safeAreaInsetBottom > 0 ? `${safeAreaInsetBottom}px` : "0",
          }}
          devicePixelRatio={devicePixelRatio}
        />
      </div>

      <div
        className="fixed bottom-2 right-4 z-[55] text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-white/70 pointer-events-none select-none"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
      >
        © 2026 MUSTAVERSE STUDIO. ALL RIGHTS RESERVED.
      </div>

      {/* 開啟資訊面板的浮動按鈕（面板開啟時隱藏，避免遮擋） */}
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

      {/* 資訊選單（教學 / 寶石圖鑑） */}
      <InfoMenuModal isOpen={isInfoMenuOpen} onClose={() => setIsInfoMenuOpen(false)} />
    </div>
  );
}
