import LoginComponent from "../components/LoginComponent";
import { useLogin } from "../hooks/useLogin";

export default function LoginPage() {
  const { login, loading, error } = useLogin();

  return (
    <LoginComponent
      loading={loading}
      error={error}
      onLogin={login}
    />
  );
}
