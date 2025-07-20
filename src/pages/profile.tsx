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
      // 1. 連接錢包
      const accounts = await window.ethereum?.request({
        method: "eth_requestAccounts",
      });
      const wallet = accounts?.[0];
      if (!wallet) throw new Error("Please connect your wallet");
      // 2. 取得 nonce
      const { nonce } = await requestBindWallet(user!.token, wallet);
      if (!nonce) throw new Error("Cannot get nonce");
      // 3. 用 MetaMask personal_sign 對 nonce 簽名
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [nonce, wallet],
      });
      // 4. confirm 綁定
      await confirmBindWallet(user!.token, wallet, signature);
      setUser({ ...user!, walletAddress: wallet });
      setBindSuccess("Wallet bound successfully!");
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
    <div className="min-h-screen flex flex-col items-center justify-center bgImg text-white">
      {/* Header*/}
      <header class="py-2 px-4 bg-[#2f334d]/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 flex justify-between items-center">
          <h1 class="text-lg text-gray-400 ">Profile</h1>

          
          <button class="btn-sub p-2 rounded-xl hover:bg-white/10 transition-colors" aria-label="Lot Out" onClick={() => {
                setUser(null);
                router.push("/login");
              }}>
              <LogOut />
          </button>
      </header>

      <div class="container p-4">
        <main class="space-y-6">
          {/* Profile Card */}
          <div class="profile-card  px-4 py-8 flex flex-col space-y-4 relative">
            {/* User Info Section */}
            <div class="flex items-center space-x-4">
              {/* Icon */}
              <div class="w-16 h-16 bg-avatar rounded-xl flex items-center justify-center  flex-shrink-0"></div>
              {/* User Info */}
              <div>
                <h2 class="text-2xl font-bold">
                  <div className="mb-2">
                    <span className="font-semibold">UserName</span>{" "}
                  </div>
                </h2>
                <p class="text-sm text-white">ID: {user?.userId}</p>
              </div>
            </div>

            {/* Wallet Info */}
            <div class="pt-4">
              <div class="flex justify-between items-center">
                {/* Left side: Label and Address */}
                <div>
                  <p class="text-white text-sm">Wallet</p>
                  <div class="flex items-center space-x-2">
                    {user?.walletAddress ? (
                      <>
                        <p class="font-mono text-lg">
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
                            class="h-5 w-5 text-yellow-200"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <span className="text-gray py-1 px-3 rounded-xl bg-gray-600/90 ">Not bound</span>
                    )}
                  </div>
                </div>
                {/* Right side: Unbind Button */}

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
          <div class="space-y-4 bg-[#898cd2]/30  p-4 rounded-lg  inset-shadow-sm inset-shadow-[#ffffff]/10">
            <div class="flex justify-between items-center">
              <h3 class="text-xl">Current Deck</h3>
              <button
                className="btn-main text-white rounded rounded-xl px-4 py-2 font-semibold bg-transparent hover:bg-blue-900/20 transition text-sm"
                onClick={() => router.push("/deck")}
              >
                Edit Deck
              </button>
            </div>

            {/* Cards Grid */}
            <div id="cards-grid">
              <div className="grid grid-cols-5 sm:grid-cols-5 gap-3">
              <div className="bg-card bg-card-empty aspect-[3/4] flex items-center justify-center text-gray-500 text-4xl">
                  +
                </div>
                <div className="bg-card bg-card-empty aspect-[3/4] flex items-center justify-center text-gray-500 text-4xl">
                  +
                </div>
                <div className="bg-card bg-card-empty aspect-[3/4] flex items-center justify-center text-gray-500 text-4xl">
                  +
                </div>
                <div className="bg-card bg-card-empty aspect-[3/4] flex items-center justify-center text-gray-500 text-4xl">
                  +
                </div>
                <div className="bg-card bg-card-empty aspect-[3/4] flex items-center justify-center text-gray-500 text-4xl">
                  +
                </div>
                <div className="bg-card bg-card-empty aspect-[3/4] flex items-center justify-center text-gray-500 text-4xl">
                  +
                </div>
                <div className="bg-card bg-card-empty aspect-[3/4] flex items-center justify-center text-gray-500 text-4xl">
                  +
                </div>
                <div className="bg-card bg-card-empty aspect-[3/4] flex items-center justify-center text-gray-500 text-4xl">
                  +
                </div>
                <div className="bg-card bg-card-empty aspect-[3/4] flex items-center justify-center text-gray-500 text-4xl">
                  +
                </div>
                <div className="bg-card bg-card-empty aspect-[3/4] flex items-center justify-center text-gray-500 text-4xl">
                  +
                </div>
              </div>
               
           
              {deckLoading ? (
                <div className="text-gray-400">Loading...</div>
              ) : deckError ? (
                <div className="text-red-400">{deckError}</div>
              ) : (
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {deck.map((id, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center bg-gray-800 rounded-lg shadow"
                    >
                      <img
                        src={`/img/${id.toString().padStart(3, "0")}.png`}
                        alt={`Card ${id}`}
                        className="w-14 h-20 object-contain rounded shadow"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* BattleComponent */}
       
        </main>
        <div className="BattleComponent fixed flex justify-center bottom-0 left-0 w-full p-2 backdrop-blur-md shadow-lg btnSection">
                <button
                  className="btn btn-main rounded-lg p-2 px-8 animate-fade-in"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      if (selectedCards.length === 10) {
                        await editGemDeck(user.token, selectedCards);
                        setCurrentDeck([...selectedCards]);
                        setSelectedCards([]);
                        localStorage.setItem("battleDeck", JSON.stringify(selectedCards));
                      } else {
                        localStorage.setItem("battleDeck", JSON.stringify(currentDeck));
                      }
                      router.push("/battle");
                    } catch (e: any) {
                      setError(e.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Battle
                </button>
   
            </div>
      </div>
    </div>
  );
}
