import { Copy } from "lucide-react"
import { useUser } from "../context/UserContext"
import { useEffect, useState } from "react"
import { getUserGems, GemItem } from "../api/auraServer"
import { useAccount } from "wagmi"
import { useRouter } from "next/router"
import { usePrivy } from "@privy-io/react-auth"

export function WalletInfo() {
  const { user } = useUser()
  const { address: connectedAddress } = useAccount()
  const { user: privyUser } = usePrivy();
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

  const handleEditClick = () => {
    router.push("/deck")
  }

  return (
    <div className=" rounded-2xl p-4 mt-4 flex items-center justify-between profile-card">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-16 h-16 bg-avatar rounded-lg flex items-center justify-center ">
          <span className="text-2xl"></span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-white">
            <span>{displayAddress}</span>
            <Copy className="w-4 h-4 cursor-pointer hover:text-yellow-200" onClick={handleCopy} />
          </div>
          <div className="text-xs text-gray-300 mt-1">{totalCards} cards</div>
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
