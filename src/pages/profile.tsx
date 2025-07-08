import { useEffect, useState } from "react";
import { requestBindWallet, confirmBindWallet } from "../api/auraServer";
import { getUserDeck, getUserGems, GemItem } from "../api/auraServer";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const [jwt, setJwt] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [bindLoading, setBindLoading] = useState(false);
  const [bindError, setBindError] = useState("");
  const [bindSuccess, setBindSuccess] = useState("");
  const [deck, setDeck] = useState<number[]>([]);
  const [gems, setGems] = useState<GemItem[]>([]);
  const [deckLoading, setDeckLoading] = useState(false);
  const [deckError, setDeckError] = useState("");
  const router = useRouter();

  // 假設 jwt/username/userId 皆存在 localStorage，實際可根據後端API調整
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    setJwt(token || "");
    // 假設登入時有存 username/userId
    setUsername(localStorage.getItem("username") || "testuser");
    setUserId(localStorage.getItem("userId") || "123456");
    // 若有綁定過錢包，也可從 localStorage 取出
    setWalletAddress(localStorage.getItem("walletAddress") || "");
  }, []);

  // 取得目前牌組與卡片資訊
  useEffect(() => {
    if (!jwt) return;
    setDeckLoading(true);
    Promise.all([
      getUserDeck(jwt),
      getUserGems(jwt)
    ]).then(([deck, gems]) => {
      setDeck(deck);
      setGems(gems);
    }).catch(e => {
      setDeckError(e.message);
    }).finally(() => setDeckLoading(false));
  }, [jwt]);

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
      const { nonce } = await requestBindWallet(jwt, wallet);
      if (!nonce) throw new Error("Cannot get nonce");
      // 3. 用 MetaMask personal_sign 對 nonce 簽名
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [nonce, wallet],
      });
      // 4. confirm 綁定
      await confirmBindWallet(jwt, wallet, signature);
      setWalletAddress(wallet);
      localStorage.setItem("walletAddress", wallet);
      setBindSuccess("Wallet bound successfully!");
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
        <div className="mb-4">
          <div className="mb-2"><span className="font-semibold">Username:</span> {username}</div>
          <div className="mb-2"><span className="font-semibold">User ID:</span> {userId}</div>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Wallet:</span>
          <span className="ml-2 break-all align-middle">
            {walletAddress ? (
              <>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                <button
                  className="ml-2 px-2 py-0.5 text-xs border border-gray-500 rounded hover:bg-gray-700 transition"
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                  title="Copy wallet address"
                >Copy</button>
              </>
            ) : (
              <span className="text-yellow-400">Not bound</span>
            )}
          </span>
        </div>
        <div className="flex flex-col gap-2 mb-8">
          {walletAddress ? (
            <button
              className="border border-red-400 text-red-300 rounded px-4 py-2 font-semibold bg-transparent hover:bg-red-900/20 transition text-base"
              onClick={() => {
                // TODO: 串接 unbindWallet API
                alert('Unbind wallet (API not implemented)');
              }}
            >
              Unbind Wallet
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

        {/* 目前牌組顯示區塊 */}
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
          <div className="grid grid-cols-5 gap-3 mb-2">
            {deck.map((id, idx) => (
              <div key={idx} className="flex flex-col items-center bg-gray-800 rounded-lg shadow p-2">
                <img
                  src={`/img/${id.toString().padStart(3, "0")}.png`}
                  alt={`Card ${id}`}
                  className="w-14 h-20 object-contain rounded shadow mb-1"
                />
                <span className="text-xs truncate w-full text-center">ID: {id}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 