import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { useUser } from "../context/UserContext"
import { useViewportRequirements } from "../context/ViewportRequirementsContext"
import { useCanvasWidth } from "../hooks/useCanvasWidth"
import { getUserDeck, getUserGems, GemItem } from "../api/auraServer"
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

  const handleTradeCardClick = (tradeData: any) => {
    setSelectedTrade(tradeData)
    setIsDetailModalOpen(true)
  }

  // Mock trades data - this should be replaced with actual API call
  const trades = [
    {
      status: "tradable",
      youGet: {
        name: "Brilliant Ruby",
        image: "/img/001.png",
        quantity: 1,
      },
      youGive: [
        { name: "Amber Topaz", image: "/img/002.png" },
        { name: "Amber Topaz", image: "/img/003.png" },
        { name: "Amber Topaz", image: "/img/004.png" },
        { name: "Amber Topaz", image: "/img/005.png" },
      ],
      tradeId: "Trade #1234344",
      address: "0x21...1234",
      serviceFee: "0.01",
    },
    {
      status: "tradable",
      youGet: {
        name: "Amber Topaz",
        image: "/img/002.png",
        quantity: 2,
      },
      youGive: [
        { name: "Brilliant Ruby", image: "/img/001.png" },
        { name: "Brilliant Ruby", image: "/img/001.png" },
      ],
      tradeId: "Trade #1234345",
      address: "0x22...5678",
      serviceFee: "0.02",
    },
    {
      status: "tradable",
      youGet: {
        name: "Brilliant Ruby",
        image: "/img/001.png",
        quantity: 1,
      },
      youGive: [
        { name: "Amber Topaz", image: "/img/002.png" },
        { name: "Amber Topaz", image: "/img/003.png" },
        { name: "Amber Topaz", image: "/img/004.png" },
        { name: "Amber Topaz", image: "/img/005.png" },
      ],
      tradeId: "Trade #1234346",
      address: "0x23...9012",
      serviceFee: "0.015",
    },
  ]

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
              {trades.map((trade, index) => (
                <TradeCard
                  key={index}
                  status={trade.status}
                  youGet={trade.youGet}
                  youGive={trade.youGive}
                  tradeId={trade.tradeId}
                  address={trade.address}
                  serviceFee={trade.serviceFee}
                  onClick={() => handleTradeCardClick(trade)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateTradeModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <DetailTradeModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        tradeData={selectedTrade}
      />
    </div>
  )
}

