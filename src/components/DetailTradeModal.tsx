import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { ChooseCardModal } from "./ChooseCardModal"
import { useUser } from "../context/UserContext"
import { getUserGems, GemItem } from "../api/auraServer"

interface Card {
  name: string
  image: string
}

interface DetailTradeModalProps {
  isOpen: boolean
  onClose: () => void
  tradeData: {
    youGet: Card
    youGive: Card[]
    tradeId: string
    address: string
    serviceFee: string
    status: string
  } | null
}

export function DetailTradeModal({ isOpen, onClose, tradeData }: DetailTradeModalProps) {
  const { user } = useUser()
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [isChooseCardOpen, setIsChooseCardOpen] = useState(false)
  const [walletCards, setWalletCards] = useState<any[]>([])

  // Fetch user gems from API
  useEffect(() => {
    if (isOpen && user?.token) {
      getUserGems(user.token)
        .then((gems: GemItem[]) => {
          const cards = gems.map((gem) => ({
            id: gem.id.toString(),
            name: gem.metadata?.name || `Card ${gem.id}`,
            image: gem.metadata?.image || `/img/${gem.id.toString().padStart(3, "0")}.png`,
            quantity: gem.quantity,
            owned: gem.quantity > 0,
          }))
          setWalletCards(cards)
        })
        .catch(() => {
          // Handle error silently
        })
    }
  }, [isOpen, user?.token])

  const handleCardSelect = (card: { id: string; name: string; image: string; quantity: number }) => {
    setSelectedCard({ name: card.name, image: card.image })
  }

  if (!isOpen || !tradeData) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-[#898cd2]/30 backdrop-blur-sm border-2 border-[#898cd2]/50 rounded-xl max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="border-b border-[#898cd2]/30 p-6 flex justify-between items-center relative">
            <h2 className="text-xl font-bold text-white text-center flex-1">DETAIL</h2>
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Diamond separator */}
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
              <div className="w-4 h-4 bg-[#898cd2] transform rotate-45" />
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 pt-8 space-y-6">
            {/* Trade Selection Area */}
            <div className="flex items-center gap-4">
              {/* You Get */}
              <div className="flex-1">
                <div className="text-sm text-gray-300 mb-3">You Get</div>
                <div className="border-2 border-[#898cd2] rounded-xl p-4 flex items-center justify-center bg-black/20 aspect-square">
                  <div className="text-center">
                    <img
                      src={tradeData.youGet.image || "/img/001.png"}
                      alt={tradeData.youGet.name}
                      className="w-24 h-32 object-cover rounded mb-2 mx-auto"
                    />
                    <p className="text-xs text-white font-semibold">{tradeData.youGet.name}</p>
                  </div>
                </div>
              </div>

              {/* Exchange Arrow */}
              <div className="flex-shrink-0">
                <div className="text-gray-400 text-2xl">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* You Give */}
              <div className="flex-1">
                <div className="text-sm text-gray-300 mb-3">
                  You Give
                  <br />
                  <span className="text-xs text-gray-400">Select Card to Swap</span>
                </div>
                <div className="border-2 border-[#898cd2] rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                  {selectedCard ? (
                    <div className="w-full">
                      <img
                        src={selectedCard.image || "/img/001.png"}
                        alt={selectedCard.name}
                        className="w-full aspect-[3/4] object-cover rounded"
                      />
                      <p className="text-xs text-white font-semibold text-center mt-2">{selectedCard.name}</p>
                    </div>
                  ) : tradeData.youGive.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      {tradeData.youGive.map((card, idx) => (
                        <div key={idx} className="border-2 border-[#898cd2] rounded-lg overflow-hidden">
                          <img
                            src={card.image || "/img/001.png"}
                            alt={card.name}
                            className="w-full aspect-square object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Trade Info Section */}
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-white font-semibold capitalize">{tradeData.status}</span>
              </div>

              {/* Trade ID and Details */}
              <div className="bg-black/20 border border-[#898cd2]/30 rounded-lg p-4 space-y-3">
                <div className="text-white font-semibold text-sm">{tradeData.tradeId}</div>
                <div className="flex justify-between">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Address</div>
                    <div className="text-white text-sm font-semibold flex items-center gap-1">
                      {tradeData.address}
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                        <path d="M3 2h7v7H3z" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-xs mb-1">Service Fee</div>
                    <div className="text-white text-sm font-semibold">{tradeData.serviceFee}</div>
                  </div>
                </div>
              </div>

              {/* Info Text */}
              <p className="text-sm text-gray-300">
                Upon completion of the transaction, the card you receive will have an{" "}
                <span className="text-[#898cd2]">[X]%</span> chance to upgrade to a higher-tier card!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={() => setIsChooseCardOpen(true)}
                className="bg-[#898cd2] text-white px-6 py-2 rounded-full font-semibold text-sm border-2 border-[#898cd2]/50 hover:shadow-lg transition-shadow"
              >
                Select Card
              </button>
              <button className="bg-[#898cd2] text-white px-8 py-2 rounded-full font-semibold text-sm border-2 border-[#898cd2]/50 hover:shadow-lg transition-shadow">
                Accept
              </button>
              <button
                onClick={onClose}
                className="bg-black/30 text-white px-6 py-2 rounded-full font-semibold text-sm border-2 border-[#898cd2]/30 hover:shadow-lg transition-shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <ChooseCardModal
        isOpen={isChooseCardOpen}
        onClose={() => setIsChooseCardOpen(false)}
        onConfirm={handleCardSelect}
        availableCards={walletCards}
      />
    </>
  )
}

