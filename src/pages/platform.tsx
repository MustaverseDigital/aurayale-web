import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/router"
import { useAccount } from "wagmi"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useUser } from "../context/UserContext"
import { useViewportRequirements } from "../context/ViewportRequirementsContext"
import { useCanvasWidth } from "../hooks/useCanvasWidth"
import {
  getUserDeck,
  getUserGems,
  GemItem,
  getActiveTradeOrders,
  getUserTradeOrders
} from "../api/auraServer"
import type { TradeOrder } from "../types/auraServer"
import { Header } from "../components/Header"
import { WalletInfo } from "../components/WalletInfo"
import { TabNavigation } from "../components/TabNavigation"
import { TradeFilters } from "../components/TradeFilters"
import { TradeCard } from "../components/TradeCard"
import { CreateTradeModal } from "../components/CreateTradeModal"
import { DetailTradeModal } from "../components/DetailTradeModal"
import { getCardImagePath } from "../lib/utils"

export default function PlatformPage() {
  const { user, setUser } = useUser()
  const { address: connectedAddress } = useAccount()
  const { user: privyUser, ready, authenticated } = usePrivy()
  const { wallets } = useWallets()
  const router = useRouter()
  const { viewportHeight, safeAreaInsetBottom } = useViewportRequirements()
  const canvasWidth = useCanvasWidth(viewportHeight)

  const [farcasterUser, setFarcasterUser] = useState<{
    username?: string;
    fid?: number;
  } | null>(null);

  // 優先使用後端認證的地址（與 WalletInfo 顯示一致），避免多錢包時地址不匹配
  const walletAddress = user?.walletAddress || privyUser?.wallet?.address || connectedAddress || null

  const [activeTab, setActiveTab] = useState<"games" | "market" | "history">("games")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<any>(null)
  const [deck, setDeck] = useState<number[]>([])
  const [gems, setGems] = useState<GemItem[]>([])
  const [deckLoading, setDeckLoading] = useState(false)
  const [trades, setTrades] = useState<any[]>([])
  const [tradesLoading, setTradesLoading] = useState(false)
  const [tradesError, setTradesError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // 取得目前牌組與卡片資訊
  useEffect(() => {
    if (!user?.token) return
    setDeckLoading(true)
    Promise.all([getUserDeck(user.token), getUserGems(user.token)])
      .then(([deckData, gemsData]) => {
        setDeck(deckData)
        setGems(gemsData)
      })
      .catch(() => {
        // Handle error silently
      })
      .finally(() => setDeckLoading(false))
  }, [user?.token])

  // 獲取交易訂單
  const fetchTrades = useCallback(async () => {
    // 先清除舊資料，避免顯示錯誤的 tab 資料
    setTrades([])
    setTradesLoading(true)
    setTradesError(null)

    if (!walletAddress && activeTab === "history") {
      setTrades([])
      setTradesLoading(false)
      return
    }

    // 將 tokenId 轉換為 gem metadata 的輔助函數
    const getGemMetadata = (tokenId: number): { name: string; image: string } => {
      const gem = gems.find((g) => g.id === tokenId)
      // 使用 getCardImagePath 來處理升級卡片
      const imagePath = getCardImagePath(tokenId)

      if (gem && gem.metadata) {
        return {
          name: gem.metadata.name || `Card ${tokenId}`,
          image: imagePath,
        }
      }
      // 默認值
      return {
        name: `Card ${tokenId}`,
        image: imagePath,
      }
    }

    // 將 TradeOrder 轉換為 TradeCard 格式
    const convertTradeOrderToCardFormat = (order: TradeOrder): any => {
      const youGetMetadata = getGemMetadata(order.offeredTokenId)
      const youGiveMetadata = order.wantedTokenIds.map((tokenId: number) => getGemMetadata(tokenId))

      // 格式化地址
      const formatAddress = (addr: string) => {
        if (addr.length <= 10) return addr
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
      }

      return {
        status: order.status.toLowerCase() === "active" ? "tradable" : order.status.toLowerCase(),
        youGet: {
          ...youGetMetadata,
          quantity: 1,
        },
        youGive: youGiveMetadata,
        tradeId: `Trade #${order.orderId}`,
        address: formatAddress(order.owner),
        serviceFee: "0.01", // 暫時使用固定值，可從 API 獲取
        orderId: order.orderId,
        originalOrder: order, // 保存原始訂單數據供 DetailModal 使用
      }
    }

    try {
      let orders: TradeOrder[] = []

      if (activeTab === "market") {
        const response = await getActiveTradeOrders({ page: 1, limit: 50, chain_id: user?.chainId })
        orders = response.orders
      } else if (activeTab === "history" && walletAddress) {
        const response = await getUserTradeOrders(walletAddress, {
          status: "all",
          page: 1,
          limit: 50,
          chain_id: user?.chainId
        })
        orders = response.orders
      }

      const convertedTrades = orders.map(convertTradeOrderToCardFormat)
      setTrades(convertedTrades)
    } catch (error: any) {
      setTradesError(error.message || "Failed to fetch trades")
      setTrades([])
    } finally {
      setTradesLoading(false)
    }
  }, [activeTab, walletAddress, gems])

  // 當 tab 切換或 gems 數據更新時，重新獲取訂單
  useEffect(() => {
    // 對於 history tab：只要有 walletAddress 就立即調用（不需要等待 gems，但 gems 載入後會重新轉換）
    if (activeTab === "history") {
      console.log("walletAddress", walletAddress)
      if (walletAddress) {
        fetchTrades()
      } else {
        // 如果沒有 walletAddress，清除資料
        setTrades([])
        setTradesLoading(false)
      }
    } else if (activeTab === "market") {
      // 對於 market tab：等待用戶資料載入完成即可（gems 可能為空）
      if (!deckLoading) {
        fetchTrades()
      }
    }
  }, [activeTab, walletAddress, gems, deckLoading, fetchTrades])

  const handleTradeCardClick = (tradeData: any) => {
    setSelectedTrade(tradeData)
    setIsDetailModalOpen(true)
  }

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
    fetchTrades() // 刷新訂單列表
  }

  const handleAcceptSuccess = () => {
    setIsDetailModalOpen(false)
    fetchTrades() // 刷新訂單列表
  }

  // 如果用戶通過 Privy 登入但沒有有效的 AuraServer token，重定向到登入頁面
  // Farcaster 登入會在 login.tsx 中處理
  useEffect(() => {
    if (ready && authenticated && privyUser && !user?.token) {
      // 如果有 Farcaster 登入但沒有 token，重定向到登入頁面處理
      if (privyUser.farcaster) {
        router.push("/aurayale");
        return;
      }
      // 對於非 Farcaster 登入，也重定向到登入頁面
      // 因為我們需要有效的 AuraServer token
      router.push("/aurayale");
    }
  }, [ready, authenticated, privyUser, user, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    // Wait for router to be ready and Privy to be ready before checking authentication
    if (!router.isReady || !ready) return

    if (!authenticated && !user?.token) {
      router.push("/aurayale")
    }
  }, [authenticated, user, router, router.isReady, ready])

  const handleEditClick = () => {
    router.push("/deck")
  }

  if (!ready || (!authenticated && !user?.token)) {
    return null
  }

  return (
    <div className="min-h-screen bgImg text-white flex flex-col overflow-x-hidden">
      {/* Unity-matched viewport container */}
      <div
        className="fixed inset-0 z-0 flex flex-col items-center justify-center bgImg overflow-x-hidden"
        style={{
          width: `${canvasWidth}px`,
          maxWidth: "100vw",
          height: viewportHeight,
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: safeAreaInsetBottom > 0 ? `${safeAreaInsetBottom}px` : '0',
        }}
      >
        {/* Header */}
        <div
          className="fixed top-0 z-10"
          style={{ width: `${canvasWidth}px`, maxWidth: "100vw", left: "50%", transform: "translateX(-50%)" }}
        >
          <Header />
        </div>

        {/* Main Content */}
        <div
          className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden w-full pt-16 pb-4"
          style={{ width: `${canvasWidth}px`, maxWidth: "100vw" }}
        >
          <div className="flex-1 flex flex-col px-3 sm:px-4">
            {/* Wallet Info */}
            <WalletInfo />

            {/* Tab Navigation */}
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
            {/* Games Tab Content - 只在 activeTab === "games" 時顯示 */}
            {activeTab === "games" && (
              <div className="mt-4 space-y-3 pb-4 tab-content" id="tab-games">
                <div className="mb-4 space-y-3 bg-cover relative">
                  <img className="rounded-[20px] shadow-lg w-full" src="/img/banner_Aurayale.jpg" alt="" />
                  <div className="bg-[#ffc100] absolute top-[0px] left-[0px] text-xs sm:text-sm p-1 rounded-tl-[20px] rounded-br-[20px] min-w-[60px] sm:min-w-[80px] text-center">HOT</div>
                  <button
                    className="bg-[#713DE9] text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold hover:opacity-70 transition absolute bottom-[0px] right-[0px] -translate-1/2"
                    onClick={handleEditClick}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-battle text-shadow-lg rounded-xl px-4 sm:px-8 py-2 text-base sm:text-xl disabled:opacity-50 disabled:cursor-not-allowed transition bg-opacity-90 hover:bg-opacity-100 inline-flex items-center justify-center h-10 w-24 sm:w-28 whitespace-nowrap absolute -translate-1/2 bottom-[0px] left-[50%]"
                    onClick={() => {
                      localStorage.setItem("battleDeck", JSON.stringify(deck));
                      router.push("/battle");
                    }}
                  >
                    Battle
                  </button>

                </div>
              </div>
            )}
            {/* Market/History Tab Content - 只在 activeTab !== "games" 時顯示 */}
            {(activeTab === "market" || activeTab === "history") && (
              <div className="tab-content" id="tab-market">
                {/* Trade Filters */}
                <TradeFilters
                  onAddClick={() => setIsCreateModalOpen(true)}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
                {/* Trade Cards List */}
                <div className="flex-1 overflow-y-auto mt-4 space-y-3 pb-4">
                  {tradesLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-gray-400">Loading trades...</div>
                    </div>
                  ) : tradesError ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-red-400 text-sm">{tradesError}</div>
                    </div>
                  ) : trades.length === 0 ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-gray-400">No trades available</div>
                    </div>
                  ) : (
                    trades
                      .filter((trade) => {
                        if (!searchTerm) return true
                        const searchLower = searchTerm.toLowerCase()
                        return (
                          trade.address.toLowerCase().includes(searchLower)
                        )
                      })
                      .map((trade, index) => {
                        const isClickable = activeTab === "market" || (activeTab === "history" && trade.status === "tradable")

                        return (
                          <TradeCard
                            key={trade.orderId || index}
                            status={trade.status}
                            youGet={trade.youGet}
                            youGive={trade.youGive}
                            tradeId={trade.tradeId}
                            address={trade.address}
                            serviceFee={trade.serviceFee}
                            onClick={isClickable ? () => handleTradeCardClick(trade) : undefined}
                          />
                        )
                      })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <CreateTradeModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
        <DetailTradeModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          tradeData={selectedTrade}
          onSuccess={handleAcceptSuccess}
        />
      </div>
    </div>
  )
}