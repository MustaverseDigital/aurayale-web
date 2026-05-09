import { Copy, Wallet, Plus } from "lucide-react"
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

  const farcasterUsername = privyUser?.farcaster?.username;
  const farcasterPfp = privyUser?.farcaster?.pfp;
  const farcasterFid = privyUser?.farcaster?.fid;
  
  // Check if we need to prompt for wallet connection/creation
  const showConnectButton = !walletAddress && wallets.length === 0;
  // If we have a privy user but no wallet at all (no address), prompt to create
  const showCreateButton = privyUser && !privyUser.wallet && wallets.length === 0;

  return (
    <div className="rounded-2xl p-3 sm:p-4 mt-4 flex items-center justify-between profile-card overflow-hidden">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#050505] border border-[#050505] rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-[0_5px_14px_rgba(0,0,0,0.16)]">
          {farcasterPfp ? (
            <img src={farcasterPfp} alt={farcasterUsername || "User"} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl sm:text-2xl text-white">{farcasterUsername ? farcasterUsername.charAt(0).toUpperCase() : ""}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {farcasterUsername && (
          <div className="text-[#0b0b0b] font-bold text-sm sm:text-lg truncate">@{farcasterUsername} <span className="text-[10px] sm:text-xs text-[#6f6250] font-normal">(FID: {farcasterFid})</span></div>
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
