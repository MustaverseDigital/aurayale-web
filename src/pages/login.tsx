import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LoginComponent from "../components/LoginComponent";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "../context/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, ready, authenticated, user: privyUser } = usePrivy();
  const { setUser } = useUser();
  const [error, setError] = useState("");

  // Handle successful login
  useEffect(() => {
    if (ready && authenticated && privyUser) {
        // User is logged in via Privy
        // We set the user context with available info.
        
        const walletAddress = privyUser.wallet?.address || "";
        const name = privyUser.email?.address || (walletAddress ? `${walletAddress.slice(0,6)}...` : "User");

        setUser({
            token: "privy-auth-token", 
            userId: 0, 
            name: name,
            walletAddress: walletAddress,
            deck: [],
            gems: []
        });

        router.push("/platform");
    }
  }, [ready, authenticated, privyUser, router, setUser]);

  const handleLogin = () => {
    setError("");
    // Use Privy's general login modal which allows email/wallet
    try {
        login(); 
    } catch (e: any) {
        console.error(e);
        setError(e.message || "Login failed");
    }
  };

  return (
    <LoginComponent
      loading={!ready || authenticated} // Show loading if not ready or already authenticated (redirecting)
      error={error}
      onLogin={handleLogin}
    />
  );
}
