interface Card {
  name: string
  image: string
}

interface TradeCardProps {
  status: string
  youGet: Card & { quantity?: number }
  youGive: Card[]
  tradeId: string
  address: string
  serviceFee: string
  onClick?: () => void
}

export function TradeCard({ status, youGet, youGive, tradeId, address, serviceFee, onClick }: TradeCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-[#898cd2]/20 backdrop-blur-sm border border-[#898cd2]/30 rounded-xl p-3 cursor-pointer hover:bg-[#898cd2]/30 hover:border-[#898cd2]/50 transition-all duration-200"
    >
      {/* Status indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="text-xs text-green-400 capitalize">{status}</span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        {/* You Get section */}
        <div className="flex-1">
          <div className="text-xs text-gray-400 mb-1.5">You Get</div>
          <div className="relative">
            <div className="w-full aspect-[3/4] bg-[#898cd2]/10 border-2 border-[#898cd2]/30 rounded-lg overflow-hidden">
              <img 
                src={youGet.image || "/img/001.png"} 
                alt={youGet.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="text-[10px] text-center mt-1 font-medium text-white truncate">{youGet.name}</div>
          </div>
        </div>

        {/* Exchange arrow */}
        <div className="flex-shrink-0 pt-4">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="opacity-40">
            <path
              d="M6 12L12 6L18 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M12 6V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M26 20L20 26L14 20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M20 26V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* You Give section */}
        <div className="flex-1">
          <div className="text-xs text-gray-400 mb-1.5">You Give</div>
          <div className="grid grid-cols-2 gap-1">
            {youGive.slice(0, 4).map((card, idx) => (
              <div key={idx} className="relative">
                <div className="w-full aspect-[3/4] bg-[#898cd2]/10 border border-[#898cd2]/20 rounded-md overflow-hidden">
                  <img 
                    src={card.image || "/img/001.png"} 
                    alt={card.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            ))}
          </div>
          {youGive.length > 0 && (
            <div className="text-[10px] text-center mt-1 font-medium text-white truncate">{youGive[0].name}</div>
          )}
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-[#898cd2]/30">
        <div className="text-xs font-semibold text-white">{tradeId}</div>
        <div className="flex justify-between items-center text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">Address</span>
            <span className="text-white font-mono">{address}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">Service Fee</span>
            <span className="text-white font-semibold">{serviceFee}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

