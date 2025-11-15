interface TabNavigationProps {
  activeTab: "market" | "history"
  setActiveTab: (tab: "market" | "history") => void
}

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="flex border-b border-[#898cd2]/30 mt-6">
      <button
        onClick={() => setActiveTab("market")}
        className={`flex-1 py-3 text-center font-semibold transition-colors ${
          activeTab === "market" 
            ? "text-white border-b-2 border-[#898cd2]" 
            : "text-gray-400"
        }`}
      >
        Market
      </button>
      <button
        onClick={() => setActiveTab("history")}
        className={`flex-1 py-3 text-center font-semibold transition-colors ${
          activeTab === "history" 
            ? "text-white border-b-2 border-[#898cd2]" 
            : "text-gray-400"
        }`}
      >
        History
      </button>
    </div>
  )
}

