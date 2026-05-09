import { Repeat2 } from "lucide-react"

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
  const isClickable = !!onClick
  
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#d6d6d6] rounded-xl transition-all duration-200 overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
        isClickable 
          ? "cursor-pointer hover:border-[#050505] hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)]" 
          : "cursor-default opacity-75"
      }`}
    >
      <div className="flex items-center justify-center bg-[#f7f7f4] p-2 sm:p-3 rounded-t-xl">
        {/* You Get section */}
        <div className="w-16 sm:w-20 shrink-0">
          <div className="text-[10px] sm:text-xs text-center text-[#565656] mb-1 sm:mb-1.5 font-black uppercase">You Get</div>
          <div>
            <div className="w-full bg-white rounded-lg border border-[#cfcfcf] shadow-[0_3px_10px_rgba(0,0,0,0.08)]">
              <img 
                src={youGet.image || "/img/001.png"} 
                alt={youGet.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="text-[9px] sm:text-[10px] text-center mt-1 font-bold text-[#333] truncate">{youGet.name}</div>
          </div>
        </div>

        {/* Exchange arrow */}
        <div className="pt-4 flex-1 max-w-[120px] sm:max-w-[160px] justify-center items-center flex px-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#cfcfcf] bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <Repeat2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#050505]" strokeWidth={2.4} />
          </div>
        </div>

        {/* You Give section */}
        <div className="w-16 sm:w-20 shrink-0">
          <div className="text-[10px] sm:text-xs text-center text-[#565656] mb-1 sm:mb-1.5 font-black uppercase">You Give</div>
          <div className="relative">
            {youGive.slice(0, 4).map((card, idx) => (
              <div key={idx} className="relative">
                <div className="w-full bg-white rounded-lg border border-[#cfcfcf] shadow-[0_3px_10px_rgba(0,0,0,0.08)]">
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
            <div className="text-[9px] sm:text-[10px] text-center mt-1 font-bold text-[#333] truncate">{youGive[0].name}</div>
          )}
        </div>
      </div>

      <div className="space-y-1 sm:space-y-1.5 pt-2 border-t border-[#050505] p-2 sm:p-3 bg-[#050505]">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 bg-white border border-white rounded-xl p-1 px-2 w-fit">
          <div className="w-2 h-2 bg-[#17b26a] rounded-full" />
          <span className="text-[10px] sm:text-xs text-[#0b0b0b] capitalize font-bold">{status}</span>
        </div>
        <div className="text-base sm:text-xl font-black text-[#f8f4ea]">{tradeId}</div>
        <div className="flex justify-between items-center gap-2">
          <div className="gap-1 sm:gap-1.5 min-w-0">
            <span className="text-[#b9ad95] text-xs sm:text-sm">Address</span><br/>
            <span className="text-[#f8f4ea] text-sm sm:text-xl font-mono truncate block">{address}</span>
          </div>
          <div className="text-right gap-1 sm:gap-1.5 shrink-0">
            <span className="text-[#b9ad95] text-xs sm:text-sm">Service Fee</span><br/>
            <span className="text-[#f8f4ea] text-sm sm:text-xl font-black">{serviceFee}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
