interface TabNavigationProps {
  activeTab: "market" | "history"
  setActiveTab: (tab: "market" | "history") => void
}

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="flex border-b border-[#FFFFFF]/30 mt-6">
      <button
        onClick={() => setActiveTab("market")}
        className={`flex-1 py-3 text-center font-semibold transition-colors ${
          activeTab === "market" 
            ? "text-[#FFC800] border-b-2 border-[#FFC800]" 
            : "text-gray-400"
        }`}
      >
        Market
      </button>
      <button
        onClick={() => setActiveTab("history")}
        className={`flex-1 py-3 text-center font-semibold transition-colors ${
          activeTab === "history" 
            ? "text-[#FFC800] border-b-2 border-[#FFC800]" 
            : "text-gray-400"
        }`}
      >
        History
      </button>
    </div>
  )
}

