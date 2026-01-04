import { Copy, Wallet, Plus } from "lucide-react"
import { useUser } from "../context/UserContext"
import { useEffect, useState } from "react"
import { getUserGems, GemItem } from "../api/auraServer"
import { useAccount } from "wagmi"
import { useRouter } from "next/router"
import { usePrivy, useWallets } from "@privy-io/react-auth"

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

  // Priority: Privy Embedded Wallet -> User context address -> Privy wallet address -> Wagmi connected address
  // We prioritize the embedded wallet as it's the primary interaction wallet for Soneium
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  
  const walletAddress = embeddedWallet?.address || user?.walletAddress || privyUser?.wallet?.address || connectedAddress || null
  
  const displayAddress = walletAddress && walletAddress.length > 10
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : walletAddress || "Connecting..."

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
    }
  }

  const handleEditClick = () => {
    router.push("/deck")
  }
  
  const handleConnectWallet = () => {
    connectWallet();
  }

  const handleCreateWallet = () => {
    createWallet();
  }

  const farcasterUsername = privyUser?.farcaster?.username;
  const farcasterPfp = privyUser?.farcaster?.pfp;
  const farcasterFid = privyUser?.farcaster?.fid;
  
  // Check if we need to prompt for wallet connection/creation
  const showConnectButton = !walletAddress && wallets.length === 0;
  // If we have a privy user but no wallet at all (no address), prompt to create
  const showCreateButton = privyUser && !privyUser.wallet && wallets.length === 0;

  return (
    <div className=" rounded-2xl p-4 mt-4 flex items-center justify-between profile-card">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-16 h-16 bg-avatar rounded-lg flex items-center justify-center overflow-hidden">
          {farcasterPfp ? (
            <img src={farcasterPfp} alt={farcasterUsername || "User"} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{farcasterUsername ? farcasterUsername.charAt(0).toUpperCase() : ""}</span>
          )}
        </div>
        <div className="flex-1">
          {farcasterUsername && (
             <div className="text-white font-bold text-lg">@{farcasterUsername} <span className="text-xs text-gray-400 font-normal">(FID: {farcasterFid})</span></div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>{displayAddress}</span>
            <Copy className="w-4 h-4 cursor-pointer hover:text-yellow-200" onClick={handleCopy} />
          </div>
          <div className="text-xs text-gray-400 mt-1">{totalCards} cards</div>
          
          {/* Wallet Actions if missing */}
          <div className="flex gap-2 mt-2">
             {showConnectButton && !showCreateButton && (
                <button 
                  onClick={handleConnectWallet}
                  className="flex items-center gap-1 text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-500 transition"
                >
                  <Wallet size={12} /> Connect Wallet
                </button>
             )}
             {showCreateButton && (
                <button 
                  onClick={handleCreateWallet}
                  className="flex items-center gap-1 text-xs bg-green-600 px-2 py-1 rounded hover:bg-green-500 transition"
                >
                  <Plus size={12} /> Create Wallet
                </button>
             )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="w-12 h-16 bg-card rounded border-2 border-[#898cd2]/30 mb-2">
          {gems.length > 0 && (
            <img
              src={`/img/${gems[0].id.toString().padStart(3, "0")}.png`}
              alt="card"
              className="w-full h-full object-contain"
            />
          )}
        </div>
        <button
          className="bg-[#713DE9] text-white px-3 py-1 rounded text-sm font-semibold hover:opacity-70 transition"
          onClick={handleEditClick}
        >
          Edit
        </button>
      </div>
    </div>
  )
}
