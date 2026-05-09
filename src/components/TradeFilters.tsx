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
        <div className="flex-1 flex items-center bg-white border border-[#d9d9d9] rounded-lg px-2 sm:px-3 min-w-0 shadow-[0_2px_0_rgba(0,0,0,0.08)]">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0b0b0b] shrink-0" />
          <input
            type="text"
            placeholder="Wallet Address"
            className="flex-1 bg-transparent border-0 outline-none px-1.5 sm:px-2 py-2 text-xs sm:text-sm text-[#0b0b0b] placeholder-[#7c715e] min-w-0"
            value={searchTerm || ''}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-1 bg-white border border-[#d9d9d9] rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm text-[#0b0b0b] shrink-0 shadow-[0_2px_0_rgba(0,0,0,0.08)] hover:border-[#050505] transition-colors">
          <span>Level</span>
          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={onAddClick}
          className="bg-[#050505] text-white border border-[#050505] rounded-lg p-1.5 sm:p-2 hover:bg-white hover:text-[#050505] transition-colors shrink-0 shadow-[0_2px_0_rgba(0,0,0,0.18)]"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  )
}
