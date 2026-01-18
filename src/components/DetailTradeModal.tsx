import { useState, useEffect, useMemo, useRef } from "react"
import { X, Loader2 } from "lucide-react"
import { ChooseCardModal } from "./ChooseCardModal"
import { useUser } from "../context/UserContext"
import { getUserGems, GemItem } from "../api/auraServer"
import { useAcceptTradeOrder } from "../hooks/useTradeOrder"
import { useWallets, usePrivy } from "@privy-io/react-auth"
import { soneiumMinato } from '../wagmi';
import { useAccount, useSwitchChain } from "wagmi"
import { getCardImagePath } from "../lib/utils"

interface Card {
  id: string
  name: string
  image: string
  quantity: number
  owned?: boolean
}

interface TradeOrder {
  orderId: string
  offeredTokenId: number
  wantedTokenIds: number[]
  owner: string
  status: string
}

interface TradeData {
  orderId?: string
  originalOrder?: TradeOrder
  [key: string]: any
}

interface DetailTradeModalProps {
  isOpen: boolean
  onClose: () => void
  tradeData: TradeData | null
  onSuccess?: () => void
}

export function DetailTradeModal({ isOpen, onClose, tradeData, onSuccess }: DetailTradeModalProps) {
  const { user } = useUser()
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [isChooseCardOpen, setIsChooseCardOpen] = useState(false)
  const [walletCards, setWalletCards] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const { chainId: wagmiChainId, isConnected, address: connectedAddress } = useAccount()
  const { user: privyUser } = usePrivy()
  const { wallets } = useWallets()

  // Soneium Minato chain ID
  const SONEIUM_MINATO_CHAIN_ID = 1946

  // Helper to determine active wallet logic
  let activeWallet: any = undefined;
  if (privyUser?.wallet) {
    activeWallet = wallets.find(w => w.address.toLowerCase() === privyUser.wallet?.address.toLowerCase());
  }

  if (!activeWallet) {
    activeWallet = wallets.find(w => w.walletClientType === 'privy' || w.connectorType === 'embedded');
  }

  if (!activeWallet) {
    activeWallet = wallets.filter(w => w.walletClientType !== 'coinbase_wallet')[0] || wallets[0];
  }

  const walletAddress = activeWallet?.address || connectedAddress || user?.walletAddress;
  const isWalletReady = !!walletAddress;

  // Robust parsing of chainId
  let currentChainId = wagmiChainId;
  if (activeWallet?.chainId) {
    if (typeof activeWallet.chainId === 'number') {
      currentChainId = activeWallet.chainId;
    } else if (typeof activeWallet.chainId === 'string') {
      const chainIdStr = activeWallet.chainId as string;
      if (chainIdStr.includes(':')) {
        const parts = chainIdStr.split(':');
        currentChainId = parts.length > 1 ? parseInt(parts[1]) : parseInt(parts[0]);
      } else {
        currentChainId = parseInt(chainIdStr);
      }
    }
  }

  // 追蹤是否已經處理過成功狀態，防止無限迴圈
  const hasHandledSuccess = useRef(false)

  const {
    acceptTradeOrder,
    isPending,
    isConfirming,
    isSuccess,
    error: contractError,
  } = useAcceptTradeOrder()

  // Fetch user gems from API
  useEffect(() => {
    if (isOpen && user?.token) {
      getUserGems(user.token)
        .then((gems: GemItem[]) => {
          const cards = gems.map((gem) => ({
            id: gem.id.toString(),
            name: gem.metadata?.name || `Card ${gem.id}`,
            image: getCardImagePath(gem.id),
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

  // 根據 wantedTokenIds 過濾可用的卡片
  const availableCards = useMemo(() => {
    if (!tradeData?.originalOrder?.wantedTokenIds || walletCards.length === 0) {
      return []
    }

    const wantedTokenIds = tradeData.originalOrder.wantedTokenIds.map((id: number) => id.toString())
    return walletCards.filter((card) => {
      // 只保留在 wantedTokenIds 中且用戶擁有的卡片
      return wantedTokenIds.includes(card.id) && card.owned !== false
    })
  }, [walletCards, tradeData?.originalOrder?.wantedTokenIds])

  const handleCardSelect = (card: { id: string; name: string; image: string; quantity: number }) => {
    setSelectedCard({ name: card.name, image: card.image, id: card.id, quantity: card.quantity })
    setSelectedCardId(card.id)
  }

  // 處理交易成功 - 使用 ref 確保只執行一次
  useEffect(() => {
    if (isSuccess && onSuccess && !hasHandledSuccess.current) {
      // 標記為已處理
      hasHandledSuccess.current = true
      // 重置狀態
      setSelectedCard(null)
      setSelectedCardId(null)
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
      setSelectedCard(null)
      setSelectedCardId(null)
      setError(null)
      // setPendingTransaction(null)
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

  const handleAccept = async () => {
    if (!tradeData) {
      setError("Trade data is missing")
      return
    }

    if (!selectedCardId) {
      setError("Please select a card to swap")
      return
    }

    if (!tradeData.orderId) {
      setError("Order ID is missing")
      return
    }

    setError(null)

    // 檢查是否已連接錢包
    if (!isWalletReady) {
      setError("Please connect your wallet first")
      return
    }

    // 將 orderId 和 selectedCardId 轉換為 bigint
    const orderId = BigInt(tradeData.orderId)
    const selectedTokenId = BigInt(selectedCardId)

    // 檢查並切換到 Soneium Minato
    if (currentChainId !== soneiumMinato.id) {
      console.log(`Current chain (${currentChainId}) is not Soneium Minato (${soneiumMinato.id}), hook will attempt switch.`);
    }

    // 調用智能合約接受訂單
    acceptTradeOrder(orderId, selectedTokenId)
  }

  const isProcessing = isPending || isConfirming

  if (!isOpen || !tradeData) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-[#3B2F36] backdrop-blur-sm border-2 border-[#3B3541]/50 rounded-xl max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="border-b border-[#877B8A] p-4 flex justify-between items-center relative">
            <h2 className="text-xl font-bold text-white text-center flex-1">DETAIL</h2>
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
          <div className="space-y-6 ">
            {/* Trade Selection Area */}
            <div className="flex items-center justify-center  gap-4 p-6 bg-exchage border-b border-[#877B8A]/60">
              {/* You Get */}
              <div className="w-30 flex-initial">
                <div className="text-sm text-white/60  text-center">You Get</div>
                <div className="rounded-xl p-2 flex items-center justify-center">
                  <div className="text-center">
                    <img
                      src={tradeData.youGet?.image || ""}
                      alt={tradeData.youGet?.name || "Card"}
                      className="w-20 object-cover rounded mx-auto mb-2"
                    />
                    <p className="text-xs text-white">{tradeData.youGet?.name}</p>
                  </div>
                </div>
              </div>

              {/* Exchange Arrow */}
              <div className="flex-shrink-0">
                <div className="text-gray-400 text-2xl">
                  <img src="/img/icon_Exchange.png" alt="" />
                </div>
              </div>

              {/* You Give */}
              <div className="w-30 flex-initial">
                <div className="text-sm text-white/60 text-center">You Give</div>
                <div className="rounded-xl p-2 min-h-45 flex items-center justify-center">
                  {selectedCard ? (
                    <div className="text-center cursor-pointer" onClick={() => setIsChooseCardOpen(true)}>
                      <img
                        src={selectedCard.image}
                        alt={selectedCard.name}
                        className="w-20 object-cover rounded mx-auto mb-2"
                      />
                      <p className="text-xs text-white">{selectedCard.name}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsChooseCardOpen(true)}
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
              <p>The card will be swapped immediately upon confirmation.</p>
              <p>
                Please confirm the card details before proceeding with the transaction.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-300 mx-6">
                {error}
              </div>
            )}

            {/* Confirm Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className="bg-[#713DE9] text-white px-12 py-2 rounded-full font-bold text-lg border-2 border-[#877B8A]/50 hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isConfirming ? "Confirming..." : "Processing..."}
                  </>
                ) : (
                  "Confirm Trade"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ChooseCardModal
        isOpen={isChooseCardOpen}
        onClose={() => setIsChooseCardOpen(false)}
        onConfirm={handleCardSelect}
        availableCards={availableCards}
        isForYouGet={false}
      />
    </>
  )
}