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
      className={`bg-[#ffffff]/10 backdrop-blur-sm border border-[#555260] rounded-xl transition-all duration-200 ${
        isClickable 
          ? "cursor-pointer hover:bg-[#ffffff]/15 hover:border-[#555260]/50" 
          : "cursor-default opacity-75"
      }`}
    >
      {/* Status indicator */}
      

      <div className="flex items-center justify-center flex-initial  bg-exchage p-3 rounded-t-xl">
        {/* You Get section */}
        <div className="w-20 flex-initial">
          <div className="text-xs text-center text-white/60 mb-1.5">You Get</div>
          <div className="">
            <div className="w-full  bg-[#898cd2]/10  rounded-lg ">
              <img 
                src={youGet.image || "/img/001.png"} 
                alt={youGet.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="text-[10px] text-center mt-1 font-medium text-white/60 truncate">{youGet.name}</div>
          </div>
        </div>

        {/* Exchange arrow */}
        <div className="pt-4 w-40 justify-center items-center flex flex-initial">
          <img  src="/img/icon_Exchange.png" alt="" />
        </div>

        {/* You Give section */}
        <div className="w-20 flex-initial">
          <div className="text-xs  text-center  text-white/60 mb-1.5">You Give</div>
          <div className="relative">
            {youGive.slice(0, 4).map((card, idx) => (
              <div key={idx} className="relative">
                <div className="w-full ">
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
            <div className="text-[10px] text-center mt-1 font-medium text-white/60 truncate">{youGive[0].name}</div>
          )}
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-[#555260] p-3 ">
        <div className="flex items-center gap-2 mb-3 bg-[#ffffff]/10 rounded-xl p-1 px-2 w-30">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-xs text-green-400 capitalize">{status}</span>
        </div>
        <div className="text-xl font-semibold text-[#D9D9D9]">{tradeId}</div>
        <div className="flex justify-between items-center">
          <div className="gap-1.5">
            <span className="text-[#7E747C]">Address</span><br/>
            <span className="text-[#D9D9D9] text-xl font-mono">{address}</span>
          </div>
          <div className="text-right gap-1.5">
            <span className="text-[#7E747C]">Service Fee</span><br/>
            <span className="text-[#D9D9D9] text-xl font-semibold">{serviceFee}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

