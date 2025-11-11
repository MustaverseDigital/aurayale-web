import { Copy } from "lucide-react"
import { useUser } from "../context/UserContext"
import { useEffect, useState } from "react"
import { getUserGems, GemItem } from "../api/auraServer"

export function WalletInfo() {
  const { user } = useUser()
  const [gems, setGems] = useState<GemItem[]>([])
  const [totalCards, setTotalCards] = useState(0)

  useEffect(() => {
    if (user?.token) {
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

  const walletAddress = user?.walletAddress || "0x00...0000"
  const displayAddress = walletAddress.length > 10 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : walletAddress

  const handleCopy = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress)
    }
  }

  return (
    <div className="bg-[#898cd2]/30 border-2 border-[#898cd2]/50 rounded-2xl p-4 mt-4 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-16 h-16 bg-avatar rounded-lg flex items-center justify-center border-2 border-[#898cd2]/50">
          <span className="text-2xl">🎴</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-white">
            <span>{displayAddress}</span>
            {user?.walletAddress && (
              <Copy className="w-4 h-4 cursor-pointer hover:text-yellow-200" onClick={handleCopy} />
            )}
          </div>
          <div className="text-xs text-gray-300 mt-1">{totalCards} cards</div>
        </div>
      </div>
      <div className="text-right">
        <div className="w-12 h-16 bg-card rounded border-2 border-[#898cd2]/30 mb-2">
          {gems.length > 0 && gems[0].metadata?.image && (
            <img 
              src={gems[0].metadata.image || `/img/${gems[0].id.toString().padStart(3, "0")}.png`} 
              alt="card" 
              className="w-full h-full object-contain" 
            />
          )}
        </div>
        <button className="bg-[#898cd2]/50 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-[#898cd2]/70 transition">
          Edit
        </button>
      </div>
    </div>
  )
}

