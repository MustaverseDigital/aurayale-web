import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/router"
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

export default function PlatformPage() {
  const { user } = useUser()
  const router = useRouter()
  const { viewportHeight, safeAreaInsetBottom } = useViewportRequirements()
  const canvasWidth = useCanvasWidth(viewportHeight)

  const [activeTab, setActiveTab] = useState<"market" | "history">("market")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<any>(null)
  const [deck, setDeck] = useState<number[]>([])
  const [gems, setGems] = useState<GemItem[]>([])
  const [deckLoading, setDeckLoading] = useState(false)
  const [trades, setTrades] = useState<any[]>([])
  const [tradesLoading, setTradesLoading] = useState(false)
  const [tradesError, setTradesError] = useState<string | null>(null)

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

    if (!user?.walletAddress && activeTab === "history") {
      setTrades([])
      setTradesLoading(false)
      return
    }

    // 只在 market tab 時才需要等待 gems 載入
    if (activeTab === "market" && gems.length === 0) {
      setTradesLoading(false)
      return
    }

    // 將 tokenId 轉換為 gem metadata 的輔助函數
    const getGemMetadata = (tokenId: number): { name: string; image: string } => {
      const gem = gems.find((g) => g.id === tokenId)
      if (gem && gem.metadata) {
        return {
          name: gem.metadata.name || `Card ${tokenId}`,
          image: gem.metadata.image || `/img/${tokenId.toString().padStart(3, "0")}.png`,
        }
      }
      // 默認值
      return {
        name: `Card ${tokenId}`,
        image: `/img/${tokenId.toString().padStart(3, "0")}.png`,
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
        const response = await getActiveTradeOrders({ page: 1, limit: 50 })
        orders = response.orders
      } else if (activeTab === "history" && user?.walletAddress) {
        const response = await getUserTradeOrders(user.walletAddress, {
          status: "all",
          page: 1,
          limit: 50
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
  }, [activeTab, user?.walletAddress, gems])

  // 當 tab 切換或 gems 數據更新時，重新獲取訂單
  useEffect(() => {
    // 對於 history tab：只要有 walletAddress 就立即調用（不需要等待 gems，但 gems 載入後會重新轉換）
    if (activeTab === "history") {
      console.log("user?.walletAddress", user?.walletAddress)
      if (user?.walletAddress) {
        fetchTrades()
      } else {
        // 如果沒有 walletAddress，清除資料
        setTrades([])
        setTradesLoading(false)
      }
    } else if (activeTab === "market") {
      // 對於 market tab：需要等待 gems 載入完成
      if (gems.length > 0) {
        fetchTrades()
      }
    }
  }, [activeTab, user?.walletAddress, fetchTrades])

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

  // Redirect to login if not authenticated
  useEffect(() => {
    // Wait for router to be ready before checking authentication
    if (!router.isReady) return

    if (!user?.token) {
      router.push("/login")
    }
  }, [user, router, router.isReady])

  if (!user?.token) {
    return null
  }

  return (
    <div className="min-h-screen bgImg text-white flex flex-col">
      {/* Unity-matched viewport container */}
      <div
        className="fixed inset-0 z-0 flex flex-col items-center justify-center bg-black"
        style={{
          width: `${canvasWidth}px`,
          height: viewportHeight,
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: safeAreaInsetBottom > 0 ? `${safeAreaInsetBottom}px` : '0',
        }}
      >
        {/* Header */}
        <div
          className="fixed top-0 z-10 w-full"
          style={{ width: `${canvasWidth}px`, left: "50%", transform: "translateX(-50%)" }}
        >
          <Header />
        </div>

        {/* Main Content */}
        <div
          className="flex-1 flex flex-col overflow-y-auto w-full pt-16 pb-4"
          style={{ width: `${canvasWidth}px` }}
        >
          <div className="flex-1 flex flex-col px-4">
            {/* Wallet Info */}
            <WalletInfo />

            {/* Tab Navigation */}
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Trade Filters */}
            <TradeFilters onAddClick={() => setIsCreateModalOpen(true)} />

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
                trades.map((trade, index) => {
                  // 在 history tab 中，只有 tradable 狀態的訂單才能點擊
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
  )
}

