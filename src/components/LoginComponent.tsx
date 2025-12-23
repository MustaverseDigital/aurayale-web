import React, { useRef, useEffect } from "react";

interface LoginComponentProps {
  onLogin: () => void;
  loading: boolean;
  error: string;
}

const LoginComponent: React.FC<LoginComponentProps> = ({
  onLogin,
  loading,
  error,
}) => {

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 嘗試在載入與首次互動時播放影片（行動裝置相容）
  useEffect(() => {
    const tryPlay = () => {
      const video = videoRef.current;
      if (!video) return;
      const playPromise = video.play();
      if (playPromise && typeof (playPromise as Promise<void>).then === 'function') {
        (playPromise as Promise<void>).catch(() => {
          // 某些瀏覽器仍需使用者互動才能播放，失敗時略過
        });
      }
    };

    // 進入頁面時先嘗試一次
    tryPlay();

    // 首次互動再嘗試一次
    const onFirstInteract = () => {
      tryPlay();
    };
    window.addEventListener('touchstart', onFirstInteract, { once: true });
    window.addEventListener('click', onFirstInteract, { once: true });

    return () => {
      window.removeEventListener('touchstart', onFirstInteract);
      window.removeEventListener('click', onFirstInteract);
    };
  }, []);

  return (
    <section className="Connect fixed w-full h-full bgImg z-2 flex flex-col ">
      <div className=" w-full h-full absolute -bottom-25"></div>
      <video ref={videoRef} className="video-container" autoPlay muted loop playsInline>
        <source src="/img/video.mp4" type="video/mp4" />
      </video>
      <div className="bgDark"></div>
      {/* Logo置頂 */}
      <div className="w-full flex flex-col items-center pt-45 z-10">
        <img src="/img/logo.png" alt="" width="256px" className="" />
      </div>
      {/* Error置中 */}
      {error && (
        <div className="flex-1 flex items-center justify-center z-10">
          <div className="text-sm bg-black/60 px-6 py-3 rounded-xl text-red-400">
            {error}
          </div>
        </div>
      )}
      {/* ConnectButton置底 */}
      <div className="w-full flex flex-col items-center justify-end pb-16 z-10 mt-auto gap-4">
        {/* ConnectButton 由父元件決定是否要加進來 */}
        <div
          className="flex flex-col gap-2 "
        >
          <button 
            type="button" 
            onClick={onLogin}
            className="btn rounded-lg mt-3 px-3 py-2 btn-primary text-white mb-5 min-w-[200px]" 
            disabled={loading}
          >
            {loading ? "Loading..." : "Login / Register"}
          </button>
        </div>
      </div>
    </section>

  );
};

export default LoginComponent; 
