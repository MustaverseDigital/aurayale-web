import { useState } from "react";
import { Menu, ChevronDown, Network } from "lucide-react";
import { useChainSwitch } from "../hooks/useChainSwitch";
import type { SupportedChain } from "../types/auraServer";
import { LogOut } from 'lucide-react';

export function Header() {
  const { currentChain, switchChain, isSwitching, getChainDisplayName } =
    useChainSwitch();
  const [showChainMenu, setShowChainMenu] = useState(false);

  const supportedChains: SupportedChain[] = ["bsc-testnet", "soneium-testnet"];

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

  return (
    <header className="bg-[#D9D9D9]/5 border-b border-[#898cd2]/30 backdrop-blur-sm">
      <div className="flex items-center justify-between p-3 max-w-md mx-auto">
        <div className="text-2xl font-bold text-white">
          <img src="/img/Logo_s.svg" alt="" />
        </div>
        <div className="flex items-center gap-2">
          {/* Chain Switch Button */}
          {currentChain && (
            <div className="relative">
              <button
                onClick={() => setShowChainMenu(!showChainMenu)}
                disabled={isSwitching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#898cd2]/20 hover:bg-[#898cd2]/30 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Network className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isSwitching
                    ? "切換中..."
                    : getChainDisplayName(currentChain)}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Chain Menu Dropdown */}
              {showChainMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowChainMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a1a2e] border border-[#898cd2]/30 rounded-lg shadow-lg z-20 overflow-hidden">
                    {supportedChains.map((chain) => (
                      <button
                        key={chain}
                        onClick={() => handleChainSwitch(chain)}
                        disabled={chain === currentChain || isSwitching}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${chain === currentChain
                            ? "bg-[#898cd2]/30 text-white font-medium"
                            : "text-gray-300 hover:bg-[#898cd2]/20 hover:text-white"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {getChainDisplayName(chain)}
                        {chain === currentChain && " ✓"}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}


          <button className="p-2">
            <LogOut className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}

