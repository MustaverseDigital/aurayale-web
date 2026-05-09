import { useState, useEffect, useRef, useMemo } from "react"
import { X, Loader2, Repeat2 } from "lucide-react"
import { ChooseCardModal } from "./ChooseCardModal"
import { useUser } from "../context/UserContext"
import { getUserGems, getUserDeck, getUserTradeOrders, GemItem } from "../api/auraServer"
import { useCreateTradeOrder } from "../hooks/useTradeOrder"
import { useWallets, usePrivy } from "@privy-io/react-auth"
import { useAccount, useSwitchChain } from "wagmi"
import { getChainFromApiChainId, getDefaultChainForLoginType } from '../lib/chainUtils';
import { getCardImagePath, getCardUpgradeLevel } from "../lib/utils"

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
  // No longer needed with useActiveWallet logic
  // const [pendingTransaction, setPendingTransaction] = useState<{ offeredTokenId: bigint; wantedTokenIds: bigint[] } | null>(null)

  const { chainId: wagmiChainId, isConnected, address: connectedAddress } = useAccount()
  const { user: privyUser } = usePrivy()
  const { wallets } = useWallets()

  // Soneium Minato chain ID
  const SONEIUM_MINATO_CHAIN_ID = 1946

  // Helper to determine active wallet logic (mirrors useTradeOrder.ts)
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

  const hasHandledSuccess = useRef(false)
  const [deckCardIds, setDeckCardIds] = useState<Set<number>>(new Set())
  const [orderedCardIds, setOrderedCardIds] = useState<Set<number>>(new Set())

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
        image: getCardImagePath(i + 1),
        quantity: 0,
      }
    })
  })[0]

  // 根據升級等級生成對應的卡片列表
  const generateCardsByLevel = (level: number): Card[] => {
    return Array.from({ length: 24 }, (_, i) => {
      const baseId = i + 1
      // 等級 0：基礎卡片 (1-24)
      // 等級 1：第一次升級 (101-124)
      // 等級 2：第二次升級 (201-224)
      const cardId = level === 0 ? baseId : level * 100 + baseId
      return {
        id: cardId.toString(),
        name: `Card ${baseId}`,
        image: getCardImagePath(cardId),
        quantity: 0,
      }
    })
  }

  // 獲取用戶牌組和活躍訂單
  useEffect(() => {
    if (isOpen && user?.token) {
      // 獲取牌組
      getUserDeck(user.token)
        .then((deck: number[]) => {
          setDeckCardIds(new Set(deck))
        })
        .catch(() => {
          // Handle error silently
        })

      // 獲取活躍訂單
      if (walletAddress) {
        getUserTradeOrders(walletAddress, { status: 'active' })
          .then((response) => {
            // 提取所有已被掛單的卡片 ID (offeredTokenId)
            const orderedIds = new Set(
              response.orders.map((order) => order.offeredTokenId)
            )
            setOrderedCardIds(orderedIds)
          })
          .catch(() => {
            // Handle error silently
          })
      }
    }
  }, [isOpen, user?.token, walletAddress])

  // Fetch user gems from API for "you give" selection
  useEffect(() => {
    if (isOpen && user?.token) {
      setLoading(true)
      getUserGems(user.token)
        .then((gems: GemItem[]) => {
          const cards: Card[] = gems.map((gem) => ({
            id: gem.id.toString(),
            name: gem.metadata?.name || `Card ${gem.id}`,
            image: getCardImagePath(gem.id),
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

  // Determine which cards to show based on choosingFor, and filter out already ordered cards (for "give") or the selected "give" card (for "get")
  const availableCards = useMemo(() => {
    let baseCards: Card[]

    if (choosingFor === "give") {
      // 選擇 "you give" 時，使用用戶擁有的卡片
      baseCards = userOwnedCards
    } else {
      // 選擇 "you get" 時，根據 "you give" 卡片的等級來決定顯示哪些卡片
      // 防呆機制：必須先選擇 "you give" 才能選擇 "you get"
      if (youGiveCard) {
        const upgradeLevel = getCardUpgradeLevel(youGiveCard.id)
        // 根據升級等級生成對應的卡片列表
        baseCards = generateCardsByLevel(upgradeLevel)
      } else {
        // 如果還沒有選擇 "you give" 卡片，返回空陣列
        baseCards = []
      }
    }

    // 過濾掉已被掛單的卡片（僅對 "you give" 適用）和 "you give" 中已選擇的卡片（僅對 "you get" 適用）
    return baseCards.filter((card) => {
      const cardId = parseInt(card.id, 10)
      // 排除已被掛單的卡片（僅對 "you give" 適用）
      if (choosingFor === "give" && orderedCardIds.has(cardId)) {
        return false
      }
      // 排除 "you give" 中已選擇的卡片（僅對 "you get" 適用）
      if (choosingFor === "get" && youGiveCard && parseInt(youGiveCard.id, 10) === cardId) {
        return false
      }
      return true
    })
  }, [choosingFor, youGiveCard, userOwnedCards, all24Cards, orderedCardIds])

  const handleChooseClick = (type: "give" | "get") => {
    // 防呆機制：選擇 "get" 時必須先選擇 "give"
    if (type === "get" && !youGiveCard) {
      setError("Please select a card to give first")
      return
    }
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
      // setPendingTransaction(null)
      // 重置成功處理標記
      hasHandledSuccess.current = false
      // 重置牌組和訂單狀態，以便下次打開時重新獲取
      setDeckCardIds(new Set())
      setOrderedCardIds(new Set())
    }
  }, [isOpen])

  // 當開始新交易時重置成功處理標記
  useEffect(() => {
    if (isPending) {
      hasHandledSuccess.current = false
    }
  }, [isPending])

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
    if (!isWalletReady) {
      setError("Please connect your wallet first")
      return
    }

    // 將卡片 ID 轉換為 bigint tokenId
    const offeredTokenId = BigInt(youGiveCard.id)
    const wantedTokenIds = youGetCards.map((card) => BigInt(card.id))

    // Chain switching is now handled inside useCreateTradeOrder (in useTradeOrder.ts)
    // We just need to ensure we are calling it.

    // Check chain ID just for UI feedback if needed, but the hook will try to switch
    const targetChain = user?.chainId
      ? getChainFromApiChainId(user.chainId)
      : getDefaultChainForLoginType(user?.loginType);
    if (currentChainId !== targetChain.id) {
      console.log(`Current chain (${currentChainId}) is not target chain (${targetChain.id}), hook will attempt switch.`);
    }

    // 調用智能合約創建訂單
    createTradeOrder(offeredTokenId, wantedTokenIds)
  }

  const isProcessing = isPending || isConfirming

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white border border-[#050505] rounded-2xl max-w-md w-full shadow-[0_10px_28px_rgba(0,0,0,0.16)] max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b border-[#e8e8e8] p-3 sm:p-4 flex justify-between items-center relative bg-white rounded-t-2xl">
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-[#050505] text-center flex-1">CREATE</h2>
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
            <div className="flex items-center gap-2 sm:gap-4 bg-[#f7f7f4] p-3 sm:p-6 border-b border-[#e8e8e8]">
              {/* You Give */}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#565656] mb-2 sm:mb-3 text-center">You Give</div>
                <div className="border border-[#cfcfcf] rounded-xl p-1.5 sm:p-2 min-h-36 sm:min-h-45 flex items-center justify-center bg-white shadow-[0_3px_10px_rgba(0,0,0,0.08)]">
                  {youGiveCard ? (
                    <div className="text-center">
                      <img
                        src={youGiveCard.image}
                        alt={youGiveCard.name}
                        className="w-16 sm:w-20 object-cover rounded mx-auto mb-1 sm:mb-2"
                      />
                      <p className="text-[10px] sm:text-xs font-bold text-[#333] truncate">{youGiveCard.name}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleChooseClick("give")}
                      className="bg-[#050505] text-white border border-[#050505] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-white hover:text-[#050505] transition-colors shadow-[0_2px_0_rgba(0,0,0,0.18)]"
                    >
                      Choose
                    </button>
                  )}
                </div>
              </div>

              {/* Exchange Arrow */}
              <div className="flex-shrink-0 px-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#cfcfcf] bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                  <Repeat2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#050505]" strokeWidth={2.4} />
                </div>
              </div>

              {/* You Get */}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#565656] mb-2 sm:mb-3 text-center">You Get</div>
                <div className="border border-[#cfcfcf] rounded-xl p-1.5 sm:p-2 min-h-36 sm:min-h-45 flex flex-col items-center justify-center gap-1.5 sm:gap-2 bg-white shadow-[0_3px_10px_rgba(0,0,0,0.08)]">
                  {youGetCards.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-1 w-full">
                        {youGetCards.map((card, idx) => (
                          <div key={idx} className="justify-center flex">
                            <img
                              src={card.image}
                              alt={card.name}
                              className="w-14 sm:w-20"
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleChooseClick("get")}
                        disabled={!youGiveCard}
                        className="bg-[#050505] text-white border border-[#050505] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-white hover:text-[#050505] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_0_rgba(0,0,0,0.18)]"
                        title={!youGiveCard ? "Please select a card to give first" : ""}
                      >
                        Choose
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleChooseClick("get")}
                      disabled={!youGiveCard}
                      className="bg-[#050505] text-white border border-[#050505] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-white hover:text-[#050505] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_0_rgba(0,0,0,0.18)]"
                      title={!youGiveCard ? "Please select a card to give first" : ""}
                    >
                      Choose
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Info Text */}
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[#565656] px-3 sm:px-6 leading-relaxed">
              <p>The card will be locked until the transaction is completed or you manually cancel it.</p>
              <p>
                Upon completion of the transaction, the card you receive will have a{" "}
                <span className="inline-block bg-[#ffc100] text-[#050505] px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-black uppercase tracking-wider align-middle">[X]%</span>{" "}
                chance to upgrade to a higher-tier card!
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-red-700 font-medium mx-3 sm:mx-6">
                {error}
              </div>
            )}

            {/* Post Button */}
            <div className="flex justify-center mb-4 sm:mb-6 px-3">
              <button
                onClick={handlePost}
                disabled={isProcessing}
                className="bg-[#050505] text-white px-8 sm:px-12 py-2.5 rounded-xl font-black uppercase tracking-wider text-base sm:text-lg border border-[#050505] hover:bg-white hover:text-[#050505] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_2px_0_rgba(0,0,0,0.18)]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
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
        isForYouGet={choosingFor === "get"}
      />
    </>
  )
}

