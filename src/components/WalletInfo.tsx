import { Copy } from "lucide-react"
import { useUser } from "../context/UserContext"
import { useEffect, useState } from "react"
import { getUserGems, GemItem } from "../api/auraServer"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useRouter } from "next/router"

export function WalletInfo() {
  const { user } = useUser()
  const { address: connectedAddress, isConnected } = useAccount()
  const router = useRouter()
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

  // 優先使用當前連接的錢包地址，如果沒有則使用綁定的錢包地址
  const walletAddress = connectedAddress || user?.walletAddress || null
  const displayAddress = walletAddress && walletAddress.length > 10
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : walletAddress || "Not connected"

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
            {walletAddress ? (
              <>
                <span>{displayAddress}</span>
                <Copy className="w-4 h-4 cursor-pointer hover:text-yellow-200" onClick={handleCopy} />
                {isConnected && connectedAddress && (
                  <span className="text-xs text-green-400">(Connected)</span>
                )}
              </>
            ) : (
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === 'authenticated');

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {!connected && (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="bg-[#713DE9] text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-70 transition-opacity"
                        >
                          Connect Wallet
                        </button>
                      )}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            )}
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

