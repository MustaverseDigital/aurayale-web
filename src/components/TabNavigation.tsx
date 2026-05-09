interface TabNavigationProps {
  activeTab: "games" | "market" | "history"
  setActiveTab: (tab: "games" | "market" | "history") => void
}

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="flex border-b border-[#e8e8e8] mt-4 sm:mt-6 bg-white">
      <button
        onClick={() => setActiveTab("games")}
        className={`flex-1 py-2.5 sm:py-3 text-center text-sm sm:text-base font-semibold transition-colors ${
          activeTab === "games"
            ? "text-[#050505] border-b-4 border-[#050505]"
            : "text-[#9a9a9a] border-b-4 border-transparent hover:text-[#050505]"
        }`}
        data-bs-toggle="tab" data-bs-target="#tab-games"
      >
        Games
      </button>
      <button
        onClick={() => setActiveTab("market")}
        className={`flex-1 py-2.5 sm:py-3 text-center text-sm sm:text-base font-semibold transition-colors ${
          activeTab === "market"
            ? "text-[#050505] border-b-4 border-[#050505]"
            : "text-[#9a9a9a] border-b-4 border-transparent hover:text-[#050505]"
        }`}
        data-bs-toggle="tab" data-bs-target="#tab-market"
      >
        Market
      </button>
      <button
        onClick={() => setActiveTab("history")}
        className={`flex-1 py-2.5 sm:py-3 text-center text-sm sm:text-base font-semibold transition-colors ${
          activeTab === "history"
            ? "text-[#050505] border-b-4 border-[#050505]"
            : "text-[#9a9a9a] border-b-4 border-transparent hover:text-[#050505]"
        }`}
        data-bs-toggle="tab" data-bs-target="#tab-market"
      >
        History
      </button>
    </div>
  )
}
