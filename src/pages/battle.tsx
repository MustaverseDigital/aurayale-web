import { useEffect, useRef, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

export default function BattlePage() {
  const [pendingDeck, setPendingDeck] = useState<string | null>(null);
  const { unityProvider, isLoaded, loadingProgression, sendMessage } = useUnityContext({
    loaderUrl: "/Build/Build.loader.js",
    dataUrl: "/Build/Build.data",
    frameworkUrl: "/Build/Build.framework.js",
    codeUrl: "/Build/Build.wasm",
  });
  // devicePixelRatio 狀態初始化
  const [devicePixelRatio, setDevicePixelRatio] = useState(
    typeof window !== "undefined" ? window.devicePixelRatio : 1
  );
  // 追蹤 viewportHeight 狀態
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800
  );
  const audioRef = useRef<HTMLAudioElement>(null);
  // 直式鎖定與提示狀態
  const [shouldShowUnity, setShouldShowUnity] = useState(true);
  const [showMobileTip, setShowMobileTip] = useState(false);

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

  // 追蹤 viewportHeight
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => setViewportHeight(window.innerHeight);
      window.addEventListener("resize", handleResize);
      window.addEventListener("orientationchange", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("orientationchange", handleResize);
      };
    }
  }, []);

  // 直式與高度自適應檢查（鎖直式體驗）
  useEffect(() => {
    if (typeof window === "undefined") return;

    function checkPlatformAndOrientation() {
      const isPortrait = window.innerHeight >= window.innerWidth;
      const hasEnoughHeight = window.innerHeight >= 400; // 高度門檻可依需求調整

      if (isPortrait && hasEnoughHeight) {
        setShouldShowUnity(true);
        setShowMobileTip(false);
      } else {
        setShouldShowUnity(false);
        setShowMobileTip(true);
      }
    }

    // 延遲檢查，避免行動裝置網址列動畫影響判斷
    const delayedCheck = () => {
      setTimeout(checkPlatformAndOrientation, 100);
    };

    checkPlatformAndOrientation();
    window.addEventListener("resize", delayedCheck);
    window.addEventListener("orientationchange", delayedCheck);
    window.addEventListener("scroll", delayedCheck);
    return () => {
      window.removeEventListener("resize", delayedCheck);
      window.removeEventListener("orientationchange", delayedCheck);
      window.removeEventListener("scroll", delayedCheck);
    };
  }, []);

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
      {/* 直式不足提示遮罩 */}
      {showMobileTip && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="px-6 py-4 rounded-lg bg-black/70 text-white text-center text-lg shadow-xl">
            請使用直式畫面並確保螢幕高度足夠以獲得最佳體驗
          </div>
        </div>
      )}

      {/* Unity WebGL Overlay：僅在符合條件時渲染 */}
      {shouldShowUnity && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90">
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
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: viewportHeight,
              visibility: isLoaded ? "visible" : "hidden",
              display: "block",
              zIndex: 1,
              background: "#000"
            }}
            devicePixelRatio={devicePixelRatio}
          />
        </div>
      )}
    </div>
  );
} 