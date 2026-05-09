import { useState, useEffect, useMemo, useRef } from "react"
import { X, Loader2, Repeat2 } from "lucide-react"
import { ChooseCardModal } from "./ChooseCardModal"
import { useUser } from "../context/UserContext"
import { getUserGems, GemItem } from "../api/auraServer"
import { useAcceptTradeOrder } from "../hooks/useTradeOrder"
import { useWallets, usePrivy } from "@privy-io/react-auth"
import { useAccount, useSwitchChain } from "wagmi"
import { getChainFromApiChainId, getDefaultChainForLoginType } from '../lib/chainUtils';
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

  // 優先使用後端認證的地址（與 WalletInfo 顯示一致），避免多錢包時地址不匹配
  const walletAddress = user?.walletAddress || activeWallet?.address || connectedAddress;
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

    // 檢查並切換到用戶對應的鏈
    const targetChain = user?.chainId
      ? getChainFromApiChainId(user.chainId)
      : getDefaultChainForLoginType(user?.loginType);
    if (currentChainId !== targetChain.id) {
      console.log(`Current chain (${currentChainId}) is not target chain (${targetChain.id}), hook will attempt switch.`);
    }

    // 調用智能合約接受訂單
    acceptTradeOrder(orderId, selectedTokenId)
  }

  const isProcessing = isPending || isConfirming

  if (!isOpen || !tradeData) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white border border-[#050505] rounded-2xl max-w-md w-full shadow-[0_10px_28px_rgba(0,0,0,0.16)] max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b border-[#e8e8e8] p-3 sm:p-4 flex justify-between items-center relative bg-white rounded-t-2xl">
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-[#050505] text-center flex-1">DETAIL</h2>
            <button
              onClick={onClose}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 text-[#050505] hover:text-[#565656] transition-colors"
              aria-label="Close"
            >
              <X size={20} className="sm:hidden" />
              <X size={24} className="hidden sm:block" />
            </button>

            {/* Diamond separator */}
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-10">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#050505] transform rotate-45" />
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Trade Selection Area */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 p-3 sm:p-6 bg-[#f7f7f4] border-b border-[#e8e8e8]">
              {/* You Get */}
              <div className="w-24 sm:w-30 shrink-0">
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#565656] text-center mb-2 sm:mb-3">You Get</div>
                <div className="border border-[#cfcfcf] rounded-xl p-1.5 sm:p-2 flex items-center justify-center bg-white shadow-[0_3px_10px_rgba(0,0,0,0.08)] min-h-36 sm:min-h-45">
                  <div className="text-center">
                    <img
                      src={tradeData.youGet?.image || ""}
                      alt={tradeData.youGet?.name || "Card"}
                      className="w-16 sm:w-20 object-cover rounded mx-auto mb-1 sm:mb-2"
                    />
                    <p className="text-[10px] sm:text-xs font-bold text-[#333] truncate">{tradeData.youGet?.name}</p>
                  </div>
                </div>
              </div>

              {/* Exchange Arrow */}
              <div className="flex-shrink-0 px-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#cfcfcf] bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                  <Repeat2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#050505]" strokeWidth={2.4} />
                </div>
              </div>

              {/* You Give */}
              <div className="w-24 sm:w-30 shrink-0">
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#565656] text-center mb-2 sm:mb-3">You Give</div>
                <div className="border border-[#cfcfcf] rounded-xl p-1.5 sm:p-2 min-h-36 sm:min-h-45 flex items-center justify-center bg-white shadow-[0_3px_10px_rgba(0,0,0,0.08)]">
                  {selectedCard ? (
                    <div className="text-center cursor-pointer" onClick={() => setIsChooseCardOpen(true)}>
                      <img
                        src={selectedCard.image}
                        alt={selectedCard.name}
                        className="w-16 sm:w-20 object-cover rounded mx-auto mb-1 sm:mb-2"
                      />
                      <p className="text-[10px] sm:text-xs font-bold text-[#333] truncate">{selectedCard.name}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsChooseCardOpen(true)}
                      className="bg-[#050505] text-white border border-[#050505] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-white hover:text-[#050505] transition-colors shadow-[0_2px_0_rgba(0,0,0,0.18)]"
                    >
                      Choose
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Info Text */}
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[#565656] px-3 sm:px-6 leading-relaxed">
              <p>The card will be swapped immediately upon confirmation.</p>
              <p>Please confirm the card details before proceeding with the transaction.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-red-700 font-medium mx-3 sm:mx-6">
                Transaction failed
              </div>
            )}

            {/* Confirm Button */}
            <div className="flex justify-center mb-4 sm:mb-6 px-3">
              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className="bg-[#050505] text-white px-8 sm:px-12 py-2.5 rounded-xl font-black uppercase tracking-wider text-base sm:text-lg border border-[#050505] hover:bg-white hover:text-[#050505] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_2px_0_rgba(0,0,0,0.18)]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
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