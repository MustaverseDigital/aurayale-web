import { useState } from "react";
import { Menu, ChevronDown, Network } from "lucide-react";
import { useChainSwitch } from "../hooks/useChainSwitch";
import type { SupportedChain } from "../types/auraServer";
import { LogOut } from 'lucide-react';
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";

export function Header() {
  const { currentChain, switchChain, isSwitching, getChainDisplayName } =
    useChainSwitch();
  const [showChainMenu, setShowChainMenu] = useState(false);
  const supportedChains: SupportedChain[] = ["bsc-testnet", "soneium-testnet"];
  const { logout } = usePrivy();
  const router = useRouter();

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
    await logout();
    router.push("/login");
  };

  return (
    <header className="bg-[#D9D9D9]/5 border-b border-[#898cd2]/30 backdrop-blur-sm">
      <div className="flex items-center justify-between p-3 max-w-md mx-auto">
        <div className="text-2xl font-bold text-white">
          <img src="/img/Logo_s.svg" alt="" />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2" onClick={handleLogout}>
            <LogOut className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}

