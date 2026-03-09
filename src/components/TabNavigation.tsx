interface TabNavigationProps {
  activeTab: "games" | "market" | "history"
  setActiveTab: (tab: "games" | "market" | "history") => void
}

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="flex border-b border-[#FFFFFF]/30 mt-4 sm:mt-6">
      <button
        onClick={() => setActiveTab("games")}
        className={`flex-1 py-2.5 sm:py-3 text-center text-sm sm:text-base font-semibold transition-colors ${
          activeTab === "games" 
            ? "text-[#FFC800] border-b-2 border-[#FFC800]" 
            : "text-gray-400"
        }`}
        data-bs-toggle="tab" data-bs-target="#tab-games"
      >
        Games
      </button>
      <button
        onClick={() => setActiveTab("market")}
        className={`flex-1 py-2.5 sm:py-3 text-center text-sm sm:text-base font-semibold transition-colors ${
          activeTab === "market" 
            ? "text-[#FFC800] border-b-2 border-[#FFC800]" 
            : "text-gray-400"
        }`}
        data-bs-toggle="tab" data-bs-target="#tab-market"
      >
        Market
      </button>
      <button
        onClick={() => setActiveTab("history")}
        className={`flex-1 py-2.5 sm:py-3 text-center text-sm sm:text-base font-semibold transition-colors ${
          activeTab === "history" 
            ? "text-[#FFC800] border-b-2 border-[#FFC800]" 
            : "text-gray-400"
        }`}
        data-bs-toggle="tab" data-bs-target="#tab-market"
      >
        History
      </button>
    </div>
  )
}

