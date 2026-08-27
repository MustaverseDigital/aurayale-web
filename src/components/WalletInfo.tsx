import { Copy, Wallet, Plus, User } from "lucide-react"
import { useUser } from "../context/UserContext"
import { useEffect, useState } from "react"
import { getUserGems, GemItem } from "../api/auraServer"
import { useAccount } from "wagmi"
import { useRouter } from "next/router"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { getCardImagePath } from "../lib/utils"

export function WalletInfo() {
  const { user } = useUser()
  const { address: connectedAddress } = useAccount()
  const { user: privyUser, connectWallet, createWallet } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter()
  const [gems, setGems] = useState<GemItem[]>([])
  const [totalCards, setTotalCards] = useState(0)

  useEffect(() => {
    if (user?.token && user.token !== "privy-auth-token") {
      getUserGems(user.token)
        .then((gemsData) => {
          setGems(gemsData)
          const total = gemsData.reduce((sum, gem) => sum + gem.quantity, 0)
          setTotalCards(total)
        })
        .catch(() => {
          // Handle error silently
        })
    }
  }, [user?.token])

  // Priority: User context address (from Privy) -> Privy wallet address -> Wagmi connected address
  // Since we are logged in with Privy, we should always have an address from the user object or privyUser
  const walletAddress = user?.walletAddress || privyUser?.wallet?.address || connectedAddress || null
  const displayAddress = walletAddress && walletAddress.length > 10
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : walletAddress || "Connecting..."

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
    }
  }

  // 顯示名稱與頭像改讀 Privy 的 Google 帳號。
  // 先前讀的是 privyUser.farcaster，但 Privy 的 loginMethods 只有
  // email / wallet / google，該物件恆為 undefined，這段 UI 從未顯示過。
  const displayName = privyUser?.google?.name ?? undefined;
  const avatarUrl = undefined; // Privy 的 google 物件不含頭像；待後端 avatarUrl 接上後再補
  
  // Check if we need to prompt for wallet connection/creation
  const showConnectButton = !walletAddress && wallets.length === 0;
  // If we have a privy user but no wallet at all (no address), prompt to create
  const showCreateButton = privyUser && !privyUser.wallet && wallets.length === 0;

  return (
    <div className="rounded-2xl p-3 sm:p-4 mt-4 flex items-center justify-between profile-card overflow-hidden">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={() => router.push("/profile")}
          aria-label="Open profile"
          className="w-12 h-12 sm:w-16 sm:h-16 bg-[#050505] border border-[#050505] rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-[0_5px_14px_rgba(0,0,0,0.16)] cursor-pointer hover:opacity-80 transition-opacity"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName || "User"} className="w-full h-full object-cover" />
          ) : displayName ? (
            <span className="text-xl sm:text-2xl text-white">{displayName.charAt(0).toUpperCase()}</span>
          ) : (
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          {displayName && (
            <div className="text-[#0b0b0b] font-bold text-sm sm:text-lg truncate">{displayName}</div>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#111]">
            <span className="truncate">{displayAddress}</span>
            <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer hover:text-[#555] shrink-0" onClick={handleCopy} />
          </div>
          <div className="text-[10px] sm:text-xs text-[#666] mt-1">{totalCards} cards</div>
        </div>
      </div>
      <div className="text-right shrink-0 ml-2">
        <div className="w-10 h-14 sm:w-12 sm:h-16 bg-white rounded border border-[#050505] mb-2 shadow-[0_5px_14px_rgba(0,0,0,0.16)]">
          {gems.length > 0 && (
            <img
              src={getCardImagePath(gems[0].id)}
              alt="card"
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </div>
    </div>
  )
}
