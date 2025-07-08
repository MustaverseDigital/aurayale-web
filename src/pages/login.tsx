import { useState } from "react";
import { useRouter } from "next/router";
import LoginComponent from "../components/LoginComponent";
import { loginWithPassword, registerWithPassword, getUserGems, getUserDeck } from "../api/auraServer";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  return (
    <LoginComponent
      username={username}
      password={password}
      loading={loading}
      error={error}
      success={success}
      showRegister={showRegister}
      onLogin={async (e) => {
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
            const { token } = await loginWithPassword(username, password);
            // 可考慮將 token 存 localStorage 或 context
            localStorage.setItem("jwt", token);
            router.push("/deck");
          }
        } catch (e: any) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      }}
      onToggleRegister={() => {
        setShowRegister((v) => !v);
        setError("");
        setSuccess("");
      }}
      onUsernameChange={e => setUsername(e.target.value)}
      onPasswordChange={e => setPassword(e.target.value)}
    />
  );
} 