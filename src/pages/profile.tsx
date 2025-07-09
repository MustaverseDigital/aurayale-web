import { useEffect, useState } from "react";
import { requestBindWallet, confirmBindWallet, unbindWallet } from "../api/auraServer";
import { getUserDeck, getUserGems, GemItem } from "../api/auraServer";
import { useRouter } from "next/router";
import { useUser } from "../context/UserContext";

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
    Promise.all([
      getUserDeck(user.token),
      getUserGems(user.token)
    ]).then(([deck, gems]) => {
      setDeck(deck);
      setGems(gems);
    }).catch(e => {
      setDeckError(e.message);
    }).finally(() => setDeckLoading(false));
  }, [user?.token]);

  // 綁定錢包流程
  const handleBindWallet = async () => {
    setBindLoading(true);
    setBindSuccess("");
    setBindError("");
    try {
      // 1. 連接錢包
      const accounts = await window.ethereum?.request({ method: "eth_requestAccounts" });
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">User Profile</h1>
        {/* User ID 區塊 */}
        <div className="mb-4">
          <div className="mb-2"><span className="font-semibold">User ID:</span> {user?.userId}</div>
        </div>
        {/* Wallet 區塊 */}
        <div className="mb-4">
          <span className="font-semibold">Wallet:</span>
          <span className="ml-2 break-all align-middle">
            {user?.walletAddress ? (
              <>
                {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                <button
                  className="ml-2 px-2 py-0.5 text-xs border border-gray-500 rounded hover:bg-gray-700 transition"
                  onClick={() => navigator.clipboard.writeText(user.walletAddress!)}
                  title="Copy wallet address"
                >Copy</button>
              </>
            ) : (
              <span className="text-yellow-400">Not bound</span>
            )}
          </span>
        </div>
        {/* 綁定/解除綁定按鈕 */}
        <div className="flex flex-col gap-2 mb-8">
          {user?.walletAddress ? (
            <button
              className="border border-red-400 text-red-300 rounded px-4 py-2 font-semibold bg-transparent hover:bg-red-900/20 transition text-base"
              onClick={handleUnbindWallet}
              disabled={bindLoading}
            >
              {bindLoading ? "Unbinding..." : "Unbind Wallet"}
            </button>
          ) : (
            <button
              className="border border-blue-400 text-blue-300 rounded px-4 py-2 font-semibold bg-transparent hover:bg-blue-900/20 transition text-base"
              onClick={handleBindWallet}
              disabled={bindLoading}
            >
              {bindLoading ? "Binding..." : "Bind Wallet"}
            </button>
          )}
        </div>
        {bindError && <div className="mt-4 text-red-400">{bindError}</div>}
        {bindSuccess && <div className="mt-4 text-green-400">{bindSuccess}</div>}
        {/* Deck 區塊 */}
        <div className="flex items-center justify-between mb-2 mt-8">
          <span className="font-semibold text-lg">Current Deck</span>
          <button
            className="border border-blue-400 text-blue-300 rounded px-4 py-2 font-semibold bg-transparent hover:bg-blue-900/20 transition text-base"
            onClick={() => router.push("/deck")}
          >
            Edit Deck
          </button>
        </div>
        {deckLoading ? (
          <div className="text-gray-400">Loading...</div>
        ) : deckError ? (
          <div className="text-red-400">{deckError}</div>
        ) : (
          <div className="grid grid-cols-5 gap-2 mb-2">
            {deck.map((id, idx) => (
              <div key={idx} className="flex flex-col items-center bg-gray-800 rounded-lg shadow">
                <img
                  src={`/img/${id.toString().padStart(3, "0")}.png`}
                  alt={`Card ${id}`}
                  className="w-14 h-20 object-contain rounded shadow"
                />
              </div>
            ))}
          </div>
        )}
        {/* Logout 區塊 */}
        <div className="flex justify-center mt-4">
          <button
            className="border border-gray-400 text-gray-300 rounded px-4 py-2 font-semibold bg-transparent hover:bg-gray-700 transition text-base"
            onClick={() => { setUser(null); router.push("/login"); }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
} 