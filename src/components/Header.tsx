import { useState } from "react";
import { Menu, ChevronDown, Network } from "lucide-react";
import { useChainSwitch } from "../hooks/useChainSwitch";
import type { SupportedChain } from "../types/auraServer";
import { LogOut } from 'lucide-react';
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import { useUser } from "../context/UserContext";

export function Header() {
  const { currentChain, switchChain, isSwitching, getChainDisplayName } =
    useChainSwitch();
  const [showChainMenu, setShowChainMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supportedChains: SupportedChain[] = ["soneium-testnet", "avax-fuji"];
  const { logout } = usePrivy();
  const router = useRouter();
  const { setUser } = useUser();

  const handleChainSwitch = async (chain: SupportedChain) => {
    if (chain === currentChain || isSwitching) return;

    try {
      await switchChain(chain);
      setShowChainMenu(false);
    } catch (error) {
      // 錯誤已在 hook 中處理
      console.error("Failed to switch chain:", error);
    }
  };

  const handleLogout = async () => {
    // 防止重複點擊
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      // 執行 Privy 登出
      await logout();
    } catch (error) {
      // 即使 Privy 登出失敗，也要清除 context 並跳轉
      console.error("Logout error:", error);
    } finally {
      // 無論如何都要清除 context 並跳轉
      setUser(null);
      router.push("/aurayale");
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-[#050505] border-b border-[#050505] w-full">
      <div className="flex items-center justify-between p-3 w-full px-3 sm:px-4">
        <div className="text-2xl font-bold text-white shrink-0">
          <img src="/img/Logo_s.svg" alt="" className="h-8 brightness-0 invert" />
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 text-white hover:text-[#d6d6d6] transition-colors"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="登出"
          >
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
