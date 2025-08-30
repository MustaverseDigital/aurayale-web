import React, { useRef, useEffect, useState } from "react";

interface LoginComponentProps {
  username: string;
  password: string;
  loading: boolean;
  error: string;
  success: string;
  showRegister: boolean;
  onLogin: (e: React.FormEvent<HTMLFormElement>) => void;
  onGoogleLogin: (idToken: string) => void;
  onToggleRegister: () => void;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({
  username,
  password,
  loading,
  error,
  success,
  showRegister,
  onLogin,
  onGoogleLogin,
  onToggleRegister,
  onUsernameChange,
  onPasswordChange,
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

  // Google Sign-In 處理函數
  const handleGoogleSignIn = (response: { credential: string }) => {
    console.log('Google Sign-In 回應:', response);
    onGoogleLogin(response.credential);
  };

  // 載入 Google Sign-In 腳本
  useEffect(() => {
    // 動態載入 Google Sign-In 腳本
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      // 腳本載入完成後初始化 Google Sign-In
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '326148801733-i5skacoksa3b6cia2f5l8akp3kg1ua7b.apps.googleusercontent.com',
          callback: handleGoogleSignIn,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            type: 'standard',
            shape: 'rectangular',
            theme: 'outline',
            text: 'signin_with',
            size: 'large',
            logo_alignment: 'left',
          }
        );
      }
    };

    return () => {
      // 清理腳本
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
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
      {(error || success) && (
        <div className="flex-1 flex items-center justify-center z-10">
          <div className={`text-sm bg-black/60 px-6 py-3 rounded-xl ${error ? "text-red-400" : "text-green-400"}`}>
            {error || success}
          </div>
        </div>
      )}
      {/* ConnectButton置底 */}
      <div className="w-full flex flex-col items-center justify-end pb-16 z-10 mt-auto gap-4">
        {/* ConnectButton 由父元件決定是否要加進來 */}
        <form
          onSubmit={onLogin}
          className="flex flex-col gap-2 "
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={onUsernameChange}
            className="input text-white px-3 py-2 rounded-lg  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-input"
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={onPasswordChange}
            className="input text-white px-3 py-2 rounded-lg  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-input"
            required
            autoComplete="current-password"
          />


          <button type="submit" className="btn rounded-lg mt-3 px-3 py-2  btn-primary  text-white mb-5" disabled={loading}>
            {showRegister ? "Register" : "Login"}
          </button>

          <div className="text-gray-400 text-center">Other Login</div>
          {/* <button type="submit" className="bgn bg-white/90 btn-white rounded-xl  px-3 py-2  btn-primary mb-10" disabled={loading}>
            Google Login
          </button> */}

          {/* Google 登入按鈕放在登入按鈕上方 */}
          <div id="google-signin-button" className="flex justify-center items-center w-full"></div>
          <button
            type="button"
            className="text-sm underline text-orange-300"
            onClick={onToggleRegister}
          >
            {showRegister ? "Have an account? Sign in." : "No account? Register. "}
          </button>
        </form>
      </div>
    </section>

  );
};

export default LoginComponent; 