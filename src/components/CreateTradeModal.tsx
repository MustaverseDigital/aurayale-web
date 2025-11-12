import { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { ChooseCardModal } from "./ChooseCardModal"
import { useUser } from "../context/UserContext"
import { getUserGems, GemItem } from "../api/auraServer"
import { useCreateTradeOrder } from "../hooks/useTradeOrder"

interface Card {
  id: string
  name: string
  image: string
  quantity: number
}

interface CreateTradeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateTradeModal({ isOpen, onClose, onSuccess }: CreateTradeModalProps) {
  const { user } = useUser()
  const [youGiveCard, setYouGiveCard] = useState<Card | null>(null)
  const [youGetCards, setYouGetCards] = useState<Card[]>([])
  const [isChooseModalOpen, setIsChooseModalOpen] = useState(false)
  const [choosingFor, setChoosingFor] = useState<"give" | "get">("give")
  const [availableCards, setAvailableCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    createTradeOrder,
    isPending,
    isConfirming,
    isSuccess,
    error: contractError,
  } = useCreateTradeOrder()

  // Fetch user gems from API
  useEffect(() => {
    if (isOpen && user?.token) {
      setLoading(true)
      getUserGems(user.token)
        .then((gems: GemItem[]) => {
          const cards: Card[] = gems.map((gem) => ({
            id: gem.id.toString(),
            name: gem.metadata?.name || `Card ${gem.id}`,
            image: gem.metadata?.image || `/img/${gem.id.toString().padStart(3, "0")}.png`,
            quantity: gem.quantity,
          }))
          setAvailableCards(cards)
        })
        .catch(() => {
          // Handle error silently
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, user?.token])

  const handleChooseClick = (type: "give" | "get") => {
    setChoosingFor(type)
    setIsChooseModalOpen(true)
  }

  const handleCardSelected = (card: Card) => {
    if (choosingFor === "give") {
      setYouGiveCard(card)
    } else {
      // For "You Get", add multiple cards (up to 4 as shown in design)
      if (youGetCards.length < 4) {
        setYouGetCards([...youGetCards, card])
      }
    }
  }

  // 處理交易成功
  useEffect(() => {
    if (isSuccess && onSuccess) {
      // 重置表單
      setYouGiveCard(null)
      setYouGetCards([])
      setError(null)
      onSuccess()
    }
  }, [isSuccess, onSuccess])

  // 處理錯誤
  useEffect(() => {
    if (contractError) {
      setError(contractError.message || "Transaction failed")
    }
  }, [contractError])

  // 當 modal 關閉時重置狀態
  useEffect(() => {
    if (!isOpen) {
      setYouGiveCard(null)
      setYouGetCards([])
      setError(null)
    }
  }, [isOpen])

  const handlePost = () => {
    if (!youGiveCard) {
      setError("Please select a card to give")
      return
    }

    if (youGetCards.length === 0) {
      setError("Please select at least one card you want to receive")
      return
    }

    setError(null)

    // 將卡片 ID 轉換為 bigint tokenId
    const offeredTokenId = BigInt(youGiveCard.id)
    const wantedTokenIds = youGetCards.map((card) => BigInt(card.id))

    // 調用智能合約創建訂單
    createTradeOrder(offeredTokenId, wantedTokenIds)
  }

  const isProcessing = isPending || isConfirming

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-[#898cd2]/30 backdrop-blur-sm border-2 border-[#898cd2]/50 rounded-xl max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="border-b border-[#898cd2]/30 p-6 flex justify-between items-center relative">
            <h2 className="text-xl font-bold text-white text-center flex-1">CREATE</h2>
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
              {/* You Give */}
              <div className="flex-1">
                <div className="text-sm text-gray-300 mb-3">You Give</div>
                <div className="border-2 border-[#898cd2] rounded-xl p-6 min-h-40 flex items-center justify-center bg-black/20">
                  {youGiveCard ? (
                    <div className="text-center">
                      <img
                        src={youGiveCard.image || "/img/001.png"}
                        alt={youGiveCard.name}
                        className="w-20 h-28 object-cover rounded mx-auto mb-2"
                      />
                      <p className="text-xs text-white">{youGiveCard.name}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleChooseClick("give")}
                      className="bg-[#898cd2] text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Choose
                    </button>
                  )}
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

              {/* You Get */}
              <div className="flex-1">
                <div className="text-sm text-gray-300 mb-3">You Get</div>
                <div className="border-2 border-[#898cd2] rounded-xl p-3 min-h-40 flex flex-col items-center justify-center gap-2">
                  {youGetCards.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {youGetCards.map((card, idx) => (
                          <div key={idx} className="border border-[#898cd2] rounded-lg overflow-hidden">
                            <img
                              src={card.image || "/img/001.png"}
                              alt={card.name}
                              className="w-full aspect-square object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleChooseClick("get")}
                        className="bg-[#898cd2] text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        Choose
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleChooseClick("get")}
                      className="bg-[#898cd2] text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Choose
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Info Text */}
            <div className="space-y-3 text-sm text-gray-300">
              <p>The card will be locked until the transaction is completed or you manually cancel it.</p>
              <p>
                Upon completion of the transaction, the card you receive will have an{" "}
                <span className="text-[#898cd2]">[X]%</span> chance to upgrade to a higher-tier card!
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Post Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handlePost}
                disabled={isProcessing}
                className="bg-[#898cd2] text-white px-12 py-3 rounded-full font-bold text-lg border-2 border-[#898cd2]/50 hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isConfirming ? "Confirming..." : "Processing..."}
                  </>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ChooseCardModal
        isOpen={isChooseModalOpen}
        onClose={() => setIsChooseModalOpen(false)}
        onConfirm={handleCardSelected}
        availableCards={availableCards}
      />
    </>
  )
}

