import { Search, ChevronDown, Plus } from "lucide-react"

interface TradeFiltersProps {
  onAddClick?: () => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function TradeFilters({ onAddClick, searchTerm, onSearchChange }: TradeFiltersProps) {
  return (
    <div className="mt-4 sm:mt-6 space-y-4">
      <div className="flex gap-1.5 sm:gap-2">
        <div className="flex-1 flex items-center bg-[#898cd2]/20 border border-[#898cd2]/30 rounded-lg px-2 sm:px-3 min-w-0">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Wallet Address"
            className="flex-1 bg-transparent border-0 outline-none px-1.5 sm:px-2 py-2 text-xs sm:text-sm text-white placeholder-gray-400 min-w-0"
            value={searchTerm || ''}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-1 bg-[#898cd2]/20 border border-[#898cd2]/30 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm text-white shrink-0">
          <span className="text-gray-300">Level</span>
          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={onAddClick}
          className="bg-[#713DE9] text-white rounded-lg p-1.5 sm:p-2 hover:bg-[#898cd2]/80 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  )
}

