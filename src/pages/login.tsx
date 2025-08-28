import { useState } from "react";
import { useRouter } from "next/router";
import LoginComponent from "../components/LoginComponent";
import { loginWithPassword, registerWithPassword, loginWithGoogle, getUserDeck, getUserGems } from "../api/auraServer";
import { useUser } from "../context/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const { setUser } = useUser();

  // Google 登入處理函數
  const handleGoogleLogin = async (idToken: string) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await loginWithGoogle(idToken);
      // 先寫入基本資料
      setUser({
        token: data.token,
        userId: data.userId,
        username: data.username,
        walletAddress: data.walletAddress || "",
      });
      // 取得 deck 與 gems
      const [deck, gems] = await Promise.all([
        getUserDeck(data.token),
        getUserGems(data.token),
      ]);
      // 寫入 context
      setUser({
        token: data.token,
        userId: data.userId,
        username: data.username,
        walletAddress: data.walletAddress || "",
        deck,
        gems,
      });
      setSuccess("Google 登入成功！");
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (e: any) {
      setError(e.message || "Google 登入失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginComponent
      username={username}
      password={password}
      loading={loading}
      error={error}
      success={success}
      showRegister={showRegister}
      onLogin={async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
          if (showRegister) {
            await registerWithPassword(username, password);
            setSuccess("註冊成功，請登入");
            setShowRegister(false);
          } else {
            const data = await loginWithPassword(username, password);
            // 先寫入基本資料
            setUser({
              token: data.token,
              userId: data.userId,
              username: data.username,
              walletAddress: data.walletAddress || "",
            });
            // 取得 deck 與 gems
            const [deck, gems] = await Promise.all([
              getUserDeck(data.token),
              getUserGems(data.token),
            ]);
            // 寫入 context
            setUser({
              token: data.token,
              userId: data.userId,
              username: data.username,
              walletAddress: data.walletAddress || "",
              deck,
              gems,
            });
            router.push("/profile");
          }
        } catch (e: any) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      }}
      onGoogleLogin={handleGoogleLogin}
      onToggleRegister={() => {
        setShowRegister((v: boolean) => !v);
        setError("");
        setSuccess("");
      }}
      onUsernameChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
      onPasswordChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
    />
  );
} 
