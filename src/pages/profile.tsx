import { useEffect, useState } from "react";
import {
  requestBindWallet,
  confirmBindWallet,
  unbindWallet,
} from "../api/auraServer";
import { getUserDeck, getUserGems, GemItem } from "../api/auraServer";
import { useRouter } from "next/router";
import { useUser } from "../context/UserContext";
import { LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [bindLoading, setBindLoading] = useState(false);
  const [bindError, setBindError] = useState("");
  const [bindSuccess, setBindSuccess] = useState("");
  const [deck, setDeck] = useState<number[]>([]);
  const [gems, setGems] = useState<GemItem[]>([]);
  const [deckLoading, setDeckLoading] = useState(false);
  const [deckError, setDeckError] = useState("");
  const router = useRouter();

  // BNB 測試鏈的配置
  const BNB_CHAIN_ID = "0x61"; // BNB Smart Chain Testnet
  const BNB_CHAIN_NAME = "BNB Smart Chain Testnet";
  const BNB_RPC_URL = "https://data-seed-prebsc-1-s1.binance.org:8545/";
  const BNB_BLOCK_EXPLORER = "https://testnet.bscscan.com/";

  // 檢查並切換到 BNB 鏈
  const switchToBNBChain = async () => {
    try {
      // 檢查是否已經在 BNB 鏈上
      const currentChainId = await window.ethereum!.request({ method: "eth_chainId" });

      if (currentChainId !== BNB_CHAIN_ID) {
        // 嘗試切換到 BNB 鏈
        await window.ethereum!.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: BNB_CHAIN_ID }],
        });
      }
    } catch (switchError: any) {
      // 如果 BNB 鏈不存在於用戶的 MetaMask 中，則添加它
      if (switchError.code === 4902) {
        try {
          await window.ethereum!.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: BNB_CHAIN_ID,
                chainName: BNB_CHAIN_NAME,
                nativeCurrency: {
                  name: "BNB",
                  symbol: "BNB",
                  decimals: 18,
                },
                rpcUrls: [BNB_RPC_URL],
                blockExplorerUrls: [BNB_BLOCK_EXPLORER],
              },
            ],
          });
        } catch (addError) {
          throw new Error("Failed to add BNB chain to MetaMask");
        }
      } else {
        throw new Error("Failed to switch to BNB chain");
      }
    }
  };

  // user 狀態已由 context 管理

  // 取得目前牌組與卡片資訊
  useEffect(() => {
    if (!user?.token) return;
    setDeckLoading(true);
    Promise.all([getUserDeck(user.token), getUserGems(user.token)])
      .then(([deck, gems]) => {
        setDeck(deck);
        setGems(gems);
      })
      .catch((e) => {
        setDeckError(e.message);
      })
      .finally(() => setDeckLoading(false));
  }, [user?.token]);

  // 綁定錢包流程
  const handleBindWallet = async () => {
    setBindLoading(true);
    setBindSuccess("");
    setBindError("");
    try {
      // 1. 檢查 MetaMask 是否已安裝
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask first.");
      }

      // 2. 切換到 BNB 鏈
      await switchToBNBChain();

      // 3. 連接錢包
      const accounts = await window.ethereum!.request({
        method: "eth_requestAccounts",
      });
      const wallet = accounts?.[0];
      if (!wallet) throw new Error("Please connect your wallet");

      // 4. 驗證是否在正確的鏈上
      const currentChainId = await window.ethereum!.request({ method: "eth_chainId" });
      if (currentChainId !== BNB_CHAIN_ID) {
        throw new Error("Please make sure you are connected to BNB Smart Chain Testnet");
      }

      // 5. 取得 nonce
      const { nonce } = await requestBindWallet(user!.token, wallet);
      if (!nonce) throw new Error("Cannot get nonce");

      // 6. 用 MetaMask personal_sign 對 nonce 簽名
      const signature = await window.ethereum!.request({
        method: "personal_sign",
        params: [nonce, wallet],
      });

      // 7. confirm 綁定
      await confirmBindWallet(user!.token, wallet, signature);
      setUser({ ...user!, walletAddress: wallet });
      setBindSuccess("Wallet bound successfully to BNB Smart Chain!");
    } catch (e: any) {
      setBindError(e.message);
    } finally {
      setBindLoading(false);
    }
  };

  const handleUnbindWallet = async () => {
    setBindLoading(true);
    setBindSuccess("");
    setBindError("");
    try {
      await unbindWallet(user!.token, user!.walletAddress!);
      setUser({ ...user!, walletAddress: "" });
      setBindSuccess("Wallet unbound successfully!");
    } catch (e: any) {
      setBindError(e.message);
    } finally {
      setBindLoading(false);
    }
  };

  return (
    <div className="min-h-screen bgImg text-white flex flex-col">
      {/* Header*/}
      <header className="py-2 px-4 border-b border-[#898cd2]/30 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 flex justify-between items-center">
        <h1 className="text-lg text-gray-400 ">Profile</h1>


        <button className="btn-square p-3 rounded-xl hover:bg-white/10 transition-colors text-xs" aria-label="Lot Out" onClick={() => {
          setUser(null);
          router.push("/login");
        }}>
          <LogOut />
        </button>
      </header>

      <div className="container flex-1 flex flex-col p-4 pt-20 pb-24 mx-auto">
        <main className="flex-1 flex flex-col space-y-6">
          {/* Profile Card */}
          <div className="profile-card  px-4 py-8 flex flex-col space-y-4 relative">
            {/* User Info Section */}
            <div className="flex items-center space-x-4">
              {/* Icon */}
              <div className="w-16 h-16 bg-avatar rounded-xl flex items-center justify-center  flex-shrink-0"></div>
              {/* User Info */}
              <div>
                <h2 className="text-2xl font-bold">
                  <div className="mb-2">
                    <span className="font-semibold">UserName</span>{" "}
                  </div>
                </h2>
                <p className="text-sm text-white">ID: {user?.userId}</p>
              </div>
            </div>

            {/* Wallet Info */}
            <div className="pt-4">
              <p className="text-white text-sm mb-3">Aurayale Gem Wallet</p>
              <div className="flex justify-between items-center">
                {/* Left side: Address/Status */}
                <div className="flex items-center space-x-2">
                  {user?.walletAddress ? (
                    <>
                      <p className="font-mono text-lg">
                        {user.walletAddress.slice(0, 6)}...
                        {user.walletAddress.slice(-4)}
                      </p>
                      <button
                        className="p-1 rounded-full hover:bg-white/10 transition-colors"
                        onClick={() =>
                          navigator.clipboard.writeText(user.walletAddress!)
                        }
                        title="Copy wallet address"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-yellow-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <span className="text-gray py-1 px-3 rounded-xl bg-gray-600/90">Not bound</span>
                  )}
                </div>
                {/* Right side: Button */}
                {user?.walletAddress ? (
                  <button
                    className="btn-red text-white font-semibold py-2 px-3 rounded-xl text-sm"
                    onClick={handleUnbindWallet}
                    disabled={bindLoading}
                  >
                    {bindLoading ? "Unbinding..." : "Unbind Wallet"}
                  </button>
                ) : (
                  <button
                    className="btn-main text-white font-semibold py-2 px-3 rounded-xl text-sm"
                    onClick={handleBindWallet}
                    disabled={bindLoading}
                  >
                    {bindLoading ? "Binding..." : "Bind Wallet"}
                  </button>
                )}
              </div>
              {bindError && (
                <div className="mt-4 bg-black/30 px-4 py-1  rounded-xl text-red-400 text-center">{bindError}</div>
              )}
              {bindSuccess && (
                <div className="mt-4 bg-black/30 px-4 py-1  rounded-xl text-green-300 text-center">{bindSuccess}</div>
              )}
            </div>

          </div>

          {/* Current Deck */}
          <div className="flex-1 flex flex-col space-y-4 bg-[#898cd2]/30  p-4 rounded-lg  inset-shadow-sm inset-shadow-[#ffffff]/10">
            <div className="flex justify-between items-center">
              <h3 className="text-xl">Current Deck</h3>
              <button
                className="btn-primary text-shadow-lg text-white rounded-xl px-4 py-2 font-semibold bg-transparent hover:bg-blue-900/20 transition text-sm"
                onClick={() => router.push("/deck")}
              >
                Edit Deck
              </button>
            </div>

            {/* Cards Grid */}
            <div id="cards-grid" className="flex-1 flex flex-col justify-center">
              {/* 決定顯示卡槽數量（與原本 + 的數量一致） */}
              {(() => {
                const totalSlots = 10;
                const shownDeck = (deck || []).slice(0, totalSlots);
                return (
                  <div className="grid grid-cols-5 sm:grid-cols-5 gap-3">
                    {Array.from({ length: totalSlots }).map((_, i) => {
                      const cardId = shownDeck[i];
                      if (deckLoading) {
                        // 載入中仍顯示占位
                        return (
                          <div key={i} className="bg-card bg-card-empty aspect-[3/4] flex items-center justify-center text-gray-500 text-2xl">
                            …
                          </div>
                        );
                      }
                      if (cardId !== undefined) {
                        return (
                          <div key={i} className="aspect-[3/4] flex items-center justify-center bg-gray-800 rounded-lg shadow ">
                            <img
                              src={`/img/${cardId.toString().padStart(3, "0")}.png`}
                              alt={`Card ${cardId}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        );
                      }
                      return (
                        <div key={i} className="bg-card bg-card-empty aspect-[3/4] flex items-center justify-center text-gray-500 text-4xl">
                          +
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {deckError && (
                <div className="text-red-400 mt-2">{deckError}</div>
              )}
            </div>
          </div>
          
          {/* Play Button Section - Always visible at bottom */}
          <div className="flex-shrink-0 text-center py-4 play-button-section">
            <p className="mb-4">Are you ready to play?</p>
            <button
                className="btn btn-battle text-shadow-lg rounded-xl px-8 py-2 text-xl disabled:opacity-50 disabled:cursor-not-allowed transition bg-opacity-90 hover:bg-opacity-100 inline-flex items-center justify-center h-15 w-58 whitespace-nowrap"
                onClick={() => {
                  localStorage.setItem("battleDeck", JSON.stringify(deck));
                  router.push("/battle");
                }}
                disabled={deck.length !== 10 || deckLoading}
                title={deck.length === 10 ? "前往戰鬥" : "需要 10 張卡片的牌組"}
              >
                Play
              </button>
          </div>

          {/* Action Buttons Section
          <div className="fixed bottom-0 left-0 right-0 w-full p-4 backdrop-blur-md shadow-lg btnSection min-h-[72px] ">
            <div className="flex items-center justify-center gap-3">
              <button
                className="btn btn-battle text-shadow-lg rounded-xl px-8 py-2 text-xl disabled:opacity-50 disabled:cursor-not-allowed transition bg-opacity-90 hover:bg-opacity-100 inline-flex items-center justify-center h-15 w-58 whitespace-nowrap"
                onClick={() => {
                  localStorage.setItem("battleDeck", JSON.stringify(deck));
                  router.push("/battle");
                }}
                disabled={deck.length !== 10 || deckLoading}
                title={deck.length === 10 ? "前往戰鬥" : "需要 10 張卡片的牌組"}
              >
                Battle
              </button>
            </div>
          </div> */}

        </main>
      </div>
    </div>
  );
}
