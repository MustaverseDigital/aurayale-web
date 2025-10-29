import { useEffect, useRef, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useViewportRequirements } from "../../context/ViewportRequirementsContext";

export default function Andong2025Page() {
  const [pendingDeck, setPendingDeck] = useState<string | null>(null);
  const { unityProvider, isLoaded, loadingProgression, sendMessage } = useUnityContext({
    loaderUrl: "/Build/Build.loader.js",
    dataUrl: "/Build/Build.data.unityweb",
    frameworkUrl: "/Build/Build.framework.js.unityweb",
    codeUrl: "/Build/Build.wasm.unityweb",
  });
  // devicePixelRatio 狀態初始化
  const [devicePixelRatio, setDevicePixelRatio] = useState(
    typeof window !== "undefined" ? window.devicePixelRatio : 1
  );
  // 計算 Unity canvas 寬度
  const [canvasWidth, setCanvasWidth] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { viewportHeight, safeAreaInsetBottom } = useViewportRequirements();

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

  // 計算 Unity canvas 寬度（直式比例 9:16）
  useEffect(() => {
    if (typeof window !== "undefined") {
      const calculateWidth = () => {
        const portraitWidth = viewportHeight * (9 / 16);
        const maxWidth = window.innerWidth;
        setCanvasWidth(Math.min(portraitWidth, maxWidth));
      };
      calculateWidth();
      window.addEventListener("resize", calculateWidth);
      return () => window.removeEventListener("resize", calculateWidth);
    }
  }, [viewportHeight]);

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
      {/* Unity WebGL Overlay：僅在符合條件時渲染 */}
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
            <div className="text-white text-2xl font-bold mb-2 flex items-center">
              <span className="ml-2 animate-bounce">Loading Game...</span>
            </div>
            <div className="text-white text-lg font-mono tracking-widest animate-pulse">
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
    </div>
  );
}
