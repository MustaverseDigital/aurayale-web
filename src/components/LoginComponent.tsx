import React from "react";

interface LoginComponentProps {
  username: string;
  password: string;
  loading: boolean;
  error: string;
  success: string;
  showRegister: boolean;
  onLogin: (e: React.FormEvent<HTMLFormElement>) => void;
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
  onToggleRegister,
  onUsernameChange,
  onPasswordChange,
}) => {
  return (
    <section className="Connect fixed w-full h-full bgImg z-2 flex flex-col">
      <div className="bgImgLogin w-full h-full absolute -bottom-25"></div>
      <div className="bgDark"></div>
      {/* Logo置頂 */}
      <div className="w-full flex flex-col items-center pt-12 z-10">
        <img src="/img/logo.png" alt="" width="256px" className="" />
        <img src="/img/X.png" alt="" width="20px" className="mb-2" />
        <img src="/img/logo2.png" alt="" width="128px" className="mb-2" />
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
          className="flex flex-col gap-2 w-64 bg-black/40 p-4 rounded-xl"
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={onUsernameChange}
            className="input bg-black text-white px-3 py-2 rounded border border-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={onPasswordChange}
            className="input bg-black text-white px-3 py-2 rounded border border-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="current-password"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {showRegister ? "註冊" : "登入"}
          </button>
          <button
            type="button"
            className="text-xs underline text-blue-300 mt-1"
            onClick={onToggleRegister}
          >
            {showRegister ? "已有帳號？登入" : "沒有帳號？註冊"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default LoginComponent; 