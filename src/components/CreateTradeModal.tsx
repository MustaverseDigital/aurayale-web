import { useState, useEffect, useRef } from "react"
import { X, Loader2 } from "lucide-react"
import { ChooseCardModal } from "./ChooseCardModal"
import { useUser } from "../context/UserContext"
import { getUserGems, GemItem } from "../api/auraServer"
import { useCreateTradeOrder } from "../hooks/useTradeOrder"
import { useAccount, useSwitchChain } from "wagmi"

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
  const [userOwnedCards, setUserOwnedCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingTransaction, setPendingTransaction] = useState<{ offeredTokenId: bigint; wantedTokenIds: bigint[] } | null>(null)
  const { chainId, isConnected } = useAccount()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()
  const hasHandledSuccess = useRef(false)

  // BSC Testnet chain ID
  const BSC_TESTNET_CHAIN_ID = 97

  const {
    createTradeOrder,
    isPending,
    isConfirming,
    isSuccess,
    error: contractError,
  } = useCreateTradeOrder()

  // Generate all 24 cards (ID 1-24) for "you get" selection
  const all24Cards = useState<Card[]>(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const id = (i + 1).toString()
      return {
        id,
        name: `Card ${id}`,
        image: `/img/${id.padStart(3, "0")}.png`,
        quantity: 0,
      }
    })
  })[0]

  // Fetch user gems from API for "you give" selection
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
          setUserOwnedCards(cards)
        })
        .catch(() => {
          // Handle error silently
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, user?.token])

  // Determine which cards to show based on choosingFor
  const availableCards = choosingFor === "give" ? userOwnedCards : all24Cards

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

  // 處理交易成功 - 使用 ref 確保只執行一次
  useEffect(() => {
    if (isSuccess && onSuccess && !hasHandledSuccess.current) {
      // 標記為已處理
      hasHandledSuccess.current = true
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
      setPendingTransaction(null)
      // 重置成功處理標記
      hasHandledSuccess.current = false
    }
  }, [isOpen])

  // 當開始新交易時重置成功處理標記
  useEffect(() => {
    if (isPending) {
      hasHandledSuccess.current = false
    }
  }, [isPending])

  // 當鏈切換到 BSC testnet 後，自動執行待處理的交易
  useEffect(() => {
    if (pendingTransaction && chainId === BSC_TESTNET_CHAIN_ID && !isSwitchingChain) {
      createTradeOrder(pendingTransaction.offeredTokenId, pendingTransaction.wantedTokenIds)
      setPendingTransaction(null)
    }
  }, [chainId, isSwitchingChain, pendingTransaction])

  const handlePost = async () => {
    if (!youGiveCard) {
      setError("Please select a card to give")
      return
    }

    if (youGetCards.length === 0) {
      setError("Please select at least one card you want to receive")
      return
    }

    setError(null)

    // 檢查是否已連接錢包
    if (!isConnected) {
      setError("Please connect your wallet first")
      return
    }

    // 將卡片 ID 轉換為 bigint tokenId
    const offeredTokenId = BigInt(youGiveCard.id)
    const wantedTokenIds = youGetCards.map((card) => BigInt(card.id))

    // 檢查並切換到 BSC testnet
    if (chainId !== BSC_TESTNET_CHAIN_ID) {
      if (switchChain) {
        try {
          // 保存待執行的交易參數
          setPendingTransaction({ offeredTokenId, wantedTokenIds })
          await switchChain({ chainId: BSC_TESTNET_CHAIN_ID })
          // 鏈切換完成後，useEffect 會自動執行交易
          return
        } catch (switchError: any) {
          setError(switchError.message || "Failed to switch to BSC testnet")
          setPendingTransaction(null)
          return
        }
      } else {
        setError("Please switch to BSC testnet manually")
        return
      }
    }

    // 調用智能合約創建訂單
    createTradeOrder(offeredTokenId, wantedTokenIds)
  }

  const isProcessing = isPending || isConfirming || isSwitchingChain

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-[#3B2F36] backdrop-blur-sm border-2 border-[#3B3541]/50 rounded-xl max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="border-b border-[#877B8A]/30 p-4 flex justify-between items-center relative">
            <h2 className="text-xl font-bold text-white text-center flex-1">CREATE</h2>
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Diamond separator */}
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
              <div className="w-4 h-4 bg-[#877B8A] transform rotate-45" />
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Trade Selection Area */}
            <div className="flex items-center gap-4 bg-exchage p-6">
              {/* You Give */}
              <div className="flex-1">
                <div className="text-sm text-gray-300 mb-3 text-center">You Give</div>
                <div className="border-2 border-[#806745] rounded-xl p-2 min-h-45 flex items-center justify-center bg-[#3C2C32]">
                  {youGiveCard ? (
                    <div className="text-center">
                      <img
                        src={youGiveCard.image || "/img/001.png"}
                        alt={youGiveCard.name}
                        className="w-20 object-cover rounded mx-auto mb-2"
                      />
                      <p className="text-xs text-white">{youGiveCard.name}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleChooseClick("give")}
                      className="bg-[#877B8A] text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Choose
                    </button>
                  )}
                </div>
              </div>

              {/* Exchange Arrow */}
              <div className="flex-shrink-0">
                <div className="text-gray-400 text-2xl">
                  <img  src="/img/icon_Exchange.png" alt="" />
                </div>
              </div>

              {/* You Get */}
              <div className="flex-1">
                <div className="text-sm text-gray-300 mb-3  text-center">You Get</div>
                <div className="border-2 border-[#806745] rounded-xl p-2 min-h-45 flex flex-col items-center justify-center gap-2 bg-[#3C2C32]">
                  {youGetCards.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-1 w-full">
                        {youGetCards.map((card, idx) => (
                          <div key={idx} className="justify-center flex">
                            <img
                              src={card.image || "/img/001.png"}
                              alt={card.name}
                              className="w-20"
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleChooseClick("get")}
                        className="bg-[#877B8A] text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        Choose
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleChooseClick("get")}
                      className="bg-[#877B8A] text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Choose
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Info Text */}
            <div className="space-y-3 text-sm text-gray-300 px-6">
              <p>The card will be locked until the transaction is completed or you manually cancel it.</p>
              <p>
                Upon completion of the transaction, the card you receive will have an{" "}
                <span className="text-[#FFC800]">[X]%</span> chance to upgrade to a higher-tier card!
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Post Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={handlePost}
                disabled={isProcessing}
                className="bg-[#713DE9] text-white px-12 py-2 rounded-full font-bold text-lg border-2 border-[#877B8A]/50 hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isSwitchingChain ? "Switching Chain..." : isConfirming ? "Confirming..." : "Processing..."}
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
        isForYouGet={choosingFor === "get"}
      />
    </>
  )
}

