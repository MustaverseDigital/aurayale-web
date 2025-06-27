"use client";

import { useState, useEffect, useRef } from "react";
import { Gamepad2, Check } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { Unity, useUnityContext } from "react-unity-webgl";

import {
  getNonce as apiGetNonce,
  signAndLogin as apiSignAndLogin,
  getUserGems as apiGetUserGems,
  getUserDeck as apiGetUserDeck,
  editGemDeck as apiEditGemDeck,
  GemItem,
} from "../api/auraServer";

export default function DeckManager() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [jwt, setJwt] = useState("");
  const [gems, setGems] = useState<GemItem[]>([]);
  const [currentDeck, setCurrentDeck] = useState<number[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUnity, setShowUnity] = useState(false);
  const [pendingDeck, setPendingDeck] = useState<string | null>(null);

  // 背景音樂音量控制
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
    }
  }, []);

  // 用戶任意點擊後觸發 BGM 播放
  useEffect(() => {
    const playBgm = () => {
      if (audioRef.current) {
        audioRef.current.play();
        window.removeEventListener("click", playBgm);
      }
    };
    window.addEventListener("click", playBgm);
    return () => window.removeEventListener("click", playBgm);
  }, []);

  // 自動登入/登出流程
  useEffect(() => {
    const login = async () => {
      setLoading(true);
      setError("");
      try {
        if (!address) return;
        const nonce = await apiGetNonce();
        // 用 wagmi 的 signMessageAsync 來簽名，支援 WalletConnect/mobile
        const signature = await signMessageAsync({ message: nonce });
        const { token } = await apiSignAndLogin(address, signature);
        setJwt(token);
        const gems = await apiGetUserGems(token);
        setGems(gems);
        const deck = await apiGetUserDeck(token);
        setCurrentDeck(Array.isArray(deck) ? deck : []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (isConnected && address) {
      login();
    } else {
      setJwt("");
      setGems([]);
      setCurrentDeck([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  // 取得卡片
  const handleGetGems = async () => {
    if (!jwt) return;
    setLoading(true);
    setError("");
    try {
      const gems = await apiGetUserGems(jwt);
      setGems(gems);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // 取得牌組
  const handleGetDeck = async () => {
    if (!jwt) return;
    setLoading(true);
    setError("");
    try {
      const deck = await apiGetUserDeck(jwt);
      setCurrentDeck(Array.isArray(deck) ? deck : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // build 牌組
  const handleUpdateDeck = async () => {
    if (selectedCards.length !== 10) return;
    setLoading(true);
    setError("");
    try {
      const newDeck = await apiEditGemDeck(jwt, selectedCards);
      setCurrentDeck(Array.isArray(newDeck) ? newDeck : []);
      setSelectedCards([]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle card selection (visual only)
  const toggleCardSelection = (cardId: number) => {
    setSelectedCards((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      } else if (prev.length < 10) {
        return [...prev, cardId];
      }
      return prev;
    });
  };

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase?.()) {
      case "common":
        return "bg-gray-500";
      case "rare":
        return "bg-blue-500";
      case "epic":
        return "bg-purple-500";
      case "legendary":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const { unityProvider, isLoaded, loadingProgression, sendMessage } = useUnityContext({
    loaderUrl: "/Build/Build.loader.js",
    dataUrl: "/Build/Build.data",
    frameworkUrl: "/Build/Build.framework.js",
    codeUrl: "/Build/Build.wasm",
  });

  // 動態追蹤 devicePixelRatio，確保 Unity 畫面高解析度
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDevicePixelRatio(window.devicePixelRatio);
      const updateDevicePixelRatio = () => setDevicePixelRatio(window.devicePixelRatio);
      const mediaMatcher = window.matchMedia(`screen and (resolution: ${window.devicePixelRatio}dppx)`);
      mediaMatcher.addEventListener("change", updateDevicePixelRatio);
      return () => {
        mediaMatcher.removeEventListener("change", updateDevicePixelRatio);
      };
    }
  }, []);

  // Unity 載入完成後自動傳送牌組資料
  useEffect(() => {
    if (isLoaded && pendingDeck) {
      console.log("pendingDeck", pendingDeck);
      sendMessage("Web", "SetCardDeck", pendingDeck);
      setPendingDeck(null);
    }
  }, [isLoaded, pendingDeck, sendMessage]);

  // 根據卡牌 id 顯示效果標示
  const getCardEffect = (id: number) => {
    if (id >= 1 && id <= 6) return "+ 100 ATK";
    if (id >= 7 && id <= 12) return "Pair + 200 ATK";
    if (id >= 13 && id <= 18) return " + 1 Mult";
    if (id >= 19 && id <= 24) return "Pair + 2 Mult";
    return "";
  };

  return (
    <div className="min-h-screen text-white flex flex-col ">
      {/* 背景音樂 */}
      <audio ref={audioRef} src="/bgm/bgm.mp3" autoPlay loop hidden />
      {!jwt && (
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
          {error && (
            <div className="flex-1 flex items-center justify-center z-10">
              <div className="text-red-400 text-sm bg-black/60 px-6 py-3 rounded-xl">
                {error}
              </div>
            </div>
          )}
          {/* ConnectButton置底 */}
          <div className="w-full flex justify-center items-end pb-16 z-10 mt-auto">
            <ConnectButton />
          </div>
        </section>
      )}

      {/* Navbar */}
      <nav className="p-4 py-2 flex items-center justify-between shadow-xs shadow-stone-800 ">
        <div className="flex items-center gap-2">
          <img src="/img/logo.png" alt="" width="126px" />
        </div>
        <ConnectButton />
      </nav>

      {error && <div className="p-4 bg-red-800 text-red-200">{error}</div>}

      {/* Current Deck Section */}
      <section className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Current Deck</h2>
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
            {selectedCards.length > 0
              ? selectedCards.length
              : currentDeck.length}
            /10
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2 p-2 pt-8 bg-deck rounded-xl">
          {Array.from({ length: 10 }).map((_, index) => {
            const useSelected = selectedCards.length > 0;
            const cardId = useSelected
              ? selectedCards[index]
              : currentDeck[index];
            const card = gems.find((g) => g.id === cardId);
            return (
              <div key={index} className="">
                {card ? (
                  <div
                    className={`text-center p-1 ${
                      useSelected ? "cursor-pointer hover:opacity-70" : ""
                    }`}
                    onClick={() => {
                      if (selectedCards.length === 0) {
                        setSelectedCards(
                          currentDeck.length ? [...currentDeck] : []
                        );
                        setTimeout(() => toggleCardSelection(cardId), 0);
                      } else if (useSelected) {
                        setSelectedCards((prev) =>
                          prev.filter((id, i) => i !== index)
                        );
                      }
                    }}
                    title={useSelected ? "Click to remove" : ""}
                  >
                    <img
                      src={`/img/${card.id.toString().padStart(3, "0")}.png`}
                      alt={card.metadata.name}
                      className="w-full aspect-[3/4] object-contain rounded mb-1"
                    />
                    <div className="text-xs font-medium truncate">
                      {card.metadata.name}
                    </div>
                  </div>
                ) : (
                  <div className="bg-card bg-card-empty aspect-[3/4] flex items-center justify-center text-gray-500 text-4xl">
                    +
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Card Selection Section */}
      <section className="px-4 pt-0 pb-20 conetnt">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Cards</h2>
          <div className="flex items-center gap-2">
            {(() => {
              const useSelected = selectedCards.length > 0;
              return (
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-secondary text-secondary-foreground">
                  {useSelected ? selectedCards.length : currentDeck.length}/10 Selected
                </span>
              );
            })()}
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {(() => {
            const useSelected = selectedCards.length > 0;
            return gems.map((gem) => {
              const isSelected = useSelected ? selectedCards.includes(gem.id) : false;
              const isInDeck = useSelected ? selectedCards.includes(gem.id) : currentDeck.includes(gem.id);
              return (
                <div
                  key={gem.id}
                  className={`rounded-lg bg-card bg-card-block text-card-foreground shadow-sm cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "ring-2 ring-blue-400 bg-blue-900/20"
                      : isInDeck
                      ? "InDeck"
                      : "bg-gray-800 hover:bg-gray-700"
                  } ${
                    useSelected && selectedCards.length >= 10 && !isSelected
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => {
                    if (!isInDeck && (useSelected ? selectedCards.length < 10 || isSelected : true)) {
                      if (!useSelected) {
                        setSelectedCards(currentDeck.length ? [...currentDeck] : []);
                        setTimeout(() => toggleCardSelection(gem.id), 0);
                      } else {
                        toggleCardSelection(gem.id);
                      }
                    }
                  }}
                >
                  <div className="p-2 flex flex-col space-y-1.5 relative overflow-hidden">
                    <img
                      src={`/img/${gem.id.toString().padStart(3, "0")}.png`}
                      alt={gem.metadata.name}
                      className="aspect-[3/4] bg-card bg-card-1 rounded mb-2 object-contain w-full"
                    />
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium truncate">
                        {gem.metadata.name}
                      </h3>
                      <div className="text-xs text-gray-400">
                        {getCardEffect(gem.id)}
                      </div>
                      {isSelected && (
                        <div className="absolute top-0 left-0 w-full h-full border border-gold rounded-lg flex items-center justify-center text-blue-400 text-xs"></div>
                      )}
                      {isInDeck && (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-green-400 bg-inDeck">
                          <Check className="w-12 h-12 mb-8 text-shadow-md" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </section>

      {/* Battle Section */}
      <section className="fixed flex justify-center bottom-0 w-full p-2 backdrop-blur-md shadow-lg btnSection">
        {(selectedCards.length === 10 || (selectedCards.length === 0 && currentDeck.length === 10)) && (
          <button
            className="btn btn-battle p-2 px-8 animate-fade-in"
            onClick={async () => {
              if (selectedCards.length === 10) {
                await handleUpdateDeck();
                const deck = selectedCards.slice(0, 10);
                setPendingDeck(JSON.stringify(deck));
                setShowUnity(true);
              } else if (selectedCards.length === 0 && currentDeck.length === 10) {
                const deck = currentDeck.slice(0, 10);
                setPendingDeck(JSON.stringify(deck));
                setShowUnity(true);
              }
            }}
          >
            Battle
          </button>
        )}
      </section>

      {/* Unity WebGL Overlay */}
      {showUnity && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90">
          {!isLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
              <div className="text-white text-2xl font-bold mb-2 flex items-center">
                <span className="ml-2 animate-bounce">Loading Game...</span>
              </div>
              <div className="text-white text-lg font-mono tracking-widest animate-pulse">
                {Math.round(loadingProgression * 100)}%
              </div>
            </div>
          )}
          <Unity
            unityProvider={unityProvider}
            style={{
              width: "100vw",
              height: "100vh",
              maxWidth: "100vw",
              maxHeight: "100vh",
              objectFit: "contain",
              background: "#000",
            }}
            devicePixelRatio={devicePixelRatio}
          />
          <button
            className="absolute top-4 left-4 bg-transparent text-transparent px-4 py-2 rounded"
            onClick={() => setShowUnity(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
