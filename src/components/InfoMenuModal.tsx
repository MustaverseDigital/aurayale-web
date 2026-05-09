import { useState, useEffect, type ComponentType } from "react"
import { X, Gamepad2, BookOpen, Gem, ShoppingBag, ArrowLeft, Sparkles, Zap } from "lucide-react"
import { getCardImagePath } from "../lib/utils"

interface InfoMenuModalProps {
  isOpen: boolean
  onClose: () => void
}

type CategoryId = "gameplay" | "encyclopedia" | "rarity" | "shop"
type Rarity = "common" | "rare" | "epic" | "legendary"

interface Category {
  id: CategoryId
  label: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
}

const categories: Category[] = [
  { id: "gameplay", label: "遊戲玩法", icon: Gamepad2 },
  { id: "encyclopedia", label: "寶石圖鑑", icon: BookOpen },
  { id: "rarity", label: "稀有判別", icon: Gem },
  { id: "shop", label: "寶石商店", icon: ShoppingBag },
]

/* ═══════════════════════════════════════════════
 * 卡片資料表(24 張基礎寶石)
 * ═══════════════════════════════════════════════ */

interface CardInfo {
  id: number
  name: string
  effect: string
  rarity: Rarity
}

const RARITY_META: Record<Rarity, { label: string; color: string; glow: string; tier: number }> = {
  common:    { label: "Common",    color: "#9a9a9a", glow: "rgba(154,154,154,0.5)", tier: 1 },
  rare:      { label: "Rare",      color: "#3b82f6", glow: "rgba(59,130,246,0.5)",  tier: 2 },
  epic:      { label: "Epic",      color: "#8b5cf6", glow: "rgba(139,92,246,0.5)",  tier: 3 },
  legendary: { label: "Legendary", color: "#ffc100", glow: "rgba(255,193,0,0.6)",   tier: 4 },
}

const CARD_DATA: CardInfo[] = [
  { id: 1,  name: "烈焰紅寶石",   effect: "對單一目標造成 12 火屬性傷害,並附加 2 回合燃燒效果。",       rarity: "common" },
  { id: 2,  name: "深海藍寶石",   effect: "減速目標 20%,持續 2 回合。對冰結目標額外造成 5 傷害。",      rarity: "common" },
  { id: 3,  name: "翡翠之心",     effect: "回復我方友軍 10 點生命值,並淨化一個負面狀態。",              rarity: "common" },
  { id: 4,  name: "黃玉之光",     effect: "對前排目標造成 14 雷屬性傷害,有 25% 機率麻痺 1 回合。",      rarity: "common" },
  { id: 5,  name: "月光石",       effect: "為我方提供 1 回合無敵護盾(最多吸收 20 傷害)。",             rarity: "common" },
  { id: 6,  name: "琥珀之眼",     effect: "解除我方所有控制效果,並提升 15% 命中率。",                   rarity: "common" },
  { id: 7,  name: "珊瑚紅淵",     effect: "對所有敵人造成 8 火屬性範圍傷害。",                          rarity: "common" },
  { id: 8,  name: "珍珠白星",     effect: "為我方全體回復 6 點生命,並淨化所有減益。",                   rarity: "common" },
  { id: 9,  name: "煙水晶",       effect: "提升我方友軍 20% 攻擊力,持續 3 回合。",                      rarity: "common" },
  { id: 10, name: "紫晶幻夢",     effect: "對單一目標造成 13 暗屬性傷害,並偷取 1 回合行動權。",         rarity: "common" },
  { id: 11, name: "血玉龍息",     effect: "造成 22 火屬性傷害,並對自身回復等同於傷害值 30% 的生命。",   rarity: "rare" },
  { id: 12, name: "冰霜結晶",     effect: "凍結目標 1 回合,並對下個出手的友軍給予 +30% 傷害加成。",     rarity: "rare" },
  { id: 13, name: "雷電瑪瑙",     effect: "對 3 個隨機敵人各造成 16 雷屬性傷害,並降低其護甲 10%。",     rarity: "rare" },
  { id: 14, name: "翠綠橄欖",     effect: "為我方全體回復 18 點生命,並提供 1 層持續性回血(每回合 +5)。", rarity: "rare" },
  { id: 15, name: "火蛋白石",     effect: "召喚一道火幕,反彈下次受到的傷害 50% 給攻擊者。",             rarity: "rare" },
  { id: 16, name: "黑曜之矛",     effect: "對裝甲目標額外 +50% 傷害,造成 25 物理傷害並擊退 1 格。",     rarity: "rare" },
  { id: 17, name: "海藍寶之淚",   effect: "對所有敵人造成 12 水屬性傷害,並使其攻擊力下降 15%。",        rarity: "rare" },
  { id: 18, name: "帝王綠翡翠",   effect: "為單一友軍提供 2 回合無敵,並回復其至滿血。",                 rarity: "epic" },
  { id: 19, name: "虎眼石之怒",   effect: "造成 35 物理傷害,若擊殺目標則回滿 1 點專注並重置冷卻。",     rarity: "epic" },
  { id: 20, name: "星辰藍寶",     effect: "降臨流星雨:3 回合內每回合對隨機敵人造成 18 傷害。",          rarity: "epic" },
  { id: 21, name: "黃金太陽石",   effect: "我方全體獲得 +40% 暴擊率,持續 3 回合。",                     rarity: "epic" },
  { id: 22, name: "夜空黑曜",     effect: "進入潛行狀態 2 回合,期間攻擊必定暴擊。",                     rarity: "epic" },
  { id: 23, name: "永恆鑽石",     effect: "復活我方陣亡的英雄,並使其獲得 100% 攻擊力加成 2 回合。",     rarity: "legendary" },
  { id: 24, name: "創世聖石",     effect: "全場淨化:解除全體敵我所有狀態,我方額外獲得 1 回合行動權。",   rarity: "legendary" },
]

const cardMap = new Map(CARD_DATA.map((c) => [c.id, c]))

/* ═══════════════════════════════════════════════
 * 主 Modal
 * ═══════════════════════════════════════════════ */

export function InfoMenuModal({ isOpen, onClose }: InfoMenuModalProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("gameplay")
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null)

  // 切換 Tab 時自動清掉卡片詳情
  useEffect(() => {
    setSelectedCardId(null)
  }, [activeCategory])

  // 關閉 Modal 時 reset 狀態
  useEffect(() => {
    if (!isOpen) {
      setSelectedCardId(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const activeLabel = categories.find((c) => c.id === activeCategory)?.label ?? ""
  const selectedCard = selectedCardId ? cardMap.get(selectedCardId) : null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[75]">
      {/*
        固定高度:採 h-[85vh] + max-h(safety),內容區 overflow-y-auto。
        切 Tab 時整體外殼尺寸不變,只內容捲軸內捲 → 避免畫面跳動。
      */}
      <div className="bg-white border border-[#050505] rounded-2xl w-full max-w-3xl shadow-[0_10px_28px_rgba(0,0,0,0.16)] h-[85vh] max-h-[640px] flex flex-col sm:flex-row overflow-hidden">
        {/* ───── Sidebar ───── */}
        <aside className="sm:w-52 sm:h-full border-b sm:border-b-0 sm:border-r border-[#e8e8e8] bg-[#f7f7f4] flex flex-col shrink-0">
          {/* Brand header */}
          <div className="p-3 sm:p-4 border-b border-[#e8e8e8] bg-white flex items-center gap-2 shrink-0">
            <Sparkles className="w-4 h-4 text-[#050505]" strokeWidth={2.4} />
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#050505]">Aurayale</h2>
          </div>

          {/* Category list */}
          <nav className="flex sm:flex-col flex-1 p-2 sm:p-3 gap-1 overflow-x-auto sm:overflow-x-hidden sm:overflow-y-auto">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 sm:shrink flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-[#050505] text-white shadow-[0_2px_0_rgba(0,0,0,0.18)]"
                      : "text-[#565656] hover:bg-white hover:text-[#050505]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={2.2} />
                  <span>{cat.label}</span>
                </button>
              )
            })}

            {/* 返回前頁 */}
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 sm:shrink sm:mt-auto flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold text-[#565656] hover:bg-white hover:text-[#050505] transition-colors whitespace-nowrap sm:border-t sm:border-[#e8e8e8] sm:pt-3 sm:mt-3"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" strokeWidth={2.2} />
              <span>返回前頁</span>
            </button>
          </nav>
        </aside>

        {/* ───── Content ───── */}
        <section className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
          <header className="border-b border-[#e8e8e8] p-3 sm:p-4 flex justify-between items-center bg-white relative shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {selectedCard && (
                <button
                  type="button"
                  onClick={() => setSelectedCardId(null)}
                  className="text-[#050505] hover:text-[#565656] transition-colors shrink-0"
                  aria-label="返回圖鑑"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#050505] truncate">
                {selectedCard ? selectedCard.name : activeLabel}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#050505] hover:text-[#565656] transition-colors shrink-0"
              aria-label="Close"
            >
              <X size={20} className="sm:hidden" />
              <X size={24} className="hidden sm:block" />
            </button>

            {/* Diamond separator */}
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-10">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#050505] transform rotate-45" />
            </div>
          </header>

          {/* Body — 唯一的捲軸區域 */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white min-h-0">
            {activeCategory === "gameplay" && <GameplayContent />}
            {activeCategory === "encyclopedia" && (
              selectedCard
                ? <CardDetail card={selectedCard} />
                : <EncyclopediaContent onCardClick={setSelectedCardId} />
            )}
            {activeCategory === "rarity" && <RarityContent />}
            {activeCategory === "shop" && <ShopContent />}
          </div>
        </section>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
 * 共用元件
 * ═══════════════════════════════════════════════ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#050505] mb-2 sm:mb-3 flex items-center gap-2">
      <span className="inline-block w-1 h-4 bg-[#050505]" />
      {children}
    </h3>
  )
}

function RarityBadge({ rarity, size = "sm" }: { rarity: Rarity; size?: "sm" | "lg" }) {
  const meta = RARITY_META[rarity]
  if (size === "lg") {
    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 font-black uppercase tracking-wider text-xs sm:text-sm"
        style={{
          borderColor: meta.color,
          color: meta.color,
          background: `${meta.color}1a`,
          boxShadow: `0 0 12px ${meta.glow}`,
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }}
        />
        {meta.label}
      </div>
    )
  }
  return (
    <div
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
      style={{
        background: `${meta.color}26`,
        color: meta.color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: meta.color }}
      />
      {meta.label}
    </div>
  )
}

/* ═══════════════════════════════════════════════
 * 各分類內容
 * ═══════════════════════════════════════════════ */

function GameplayContent() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <section>
        <SectionTitle>什麼是 Aurayale</SectionTitle>
        <p className="text-sm text-[#333] leading-relaxed">
          Aurayale 是一款以「寶石」為主題的鏈上集換式對戰遊戲,玩家透過收集、合成、交易寶石卡片組成自己的牌組,進行回合制策略對戰。
        </p>
      </section>

      <section>
        <SectionTitle>遊戲流程</SectionTitle>
        <ol className="space-y-2 text-sm text-[#333] leading-relaxed list-decimal list-inside marker:text-[#050505] marker:font-black">
          <li>連接錢包,完成登入並領取起始牌組。</li>
          <li>於「Deck」頁面挑選 5 張寶石組成戰鬥牌組。</li>
          <li>進入「Battle」開始對局,每回合出牌與對手比拚屬性。</li>
          <li>勝場可獲得寶石碎片,於市場交易升級你的牌組。</li>
        </ol>
      </section>

      <section>
        <SectionTitle>核心機制</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
          {[
            { t: "屬性相剋", d: "火 / 水 / 風 / 土 / 光 / 暗 互相壓制" },
            { t: "升級系統", d: "兩張同色寶石可合成更高級的卡片" },
            { t: "稀有度判定", d: "依 4C 標準分為一般 / 稀有 / 史詩 / 傳說" },
            { t: "寶石市集", d: "與其他玩家直接以寶石換寶石" },
          ].map((item) => (
            <div key={item.t} className="border border-[#cfcfcf] rounded-lg p-3 bg-[#f7f7f4] shadow-[0_2px_0_rgba(0,0,0,0.06)]">
              <div className="text-xs font-black uppercase tracking-wider text-[#050505] mb-1">{item.t}</div>
              <div className="text-xs text-[#565656] leading-relaxed">{item.d}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function EncyclopediaContent({ onCardClick }: { onCardClick: (id: number) => void }) {
  return (
    <div className="space-y-5">
      <section>
        <SectionTitle>基礎寶石(24 種)</SectionTitle>
        <p className="text-xs text-[#565656] mb-3 leading-relaxed">
          點擊任意卡片查看詳細資料(名稱、效果、稀有度)。每種寶石都有三個升級階段(基礎 / +1 / +2)。
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
          {CARD_DATA.map((card) => {
            const meta = RARITY_META[card.rarity]
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onCardClick(card.id)}
                className="group bg-white border border-[#cfcfcf] rounded-lg overflow-hidden shadow-[0_3px_10px_rgba(0,0,0,0.08)] hover:shadow-[0_5px_14px_rgba(0,0,0,0.16)] hover:border-[#050505] hover:scale-[1.03] transition-all relative text-left"
                aria-label={`查看 ${card.name} 詳細資料`}
              >
                {/* 稀有度色條 */}
                <div className="h-1" style={{ background: meta.color, boxShadow: `0 0 8px ${meta.glow}` }} />
                <img
                  src={getCardImagePath(card.id)}
                  alt={card.name}
                  className="w-full object-cover"
                />
                <div className="p-1 text-center bg-white">
                  <div className="text-[9px] sm:text-[10px] font-black text-[#050505]">
                    #{String(card.id).padStart(3, "0")}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function CardDetail({ card }: { card: CardInfo }) {
  const meta = RARITY_META[card.rarity]
  return (
    <div className="space-y-5">
      {/* 主視覺區:卡圖 + 名稱/稀有度 */}
      <div
        className="relative rounded-2xl border-2 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
        style={{
          background: `linear-gradient(135deg, ${meta.color}14, ${meta.color}05)`,
          borderColor: meta.color,
          boxShadow: `0 8px 24px ${meta.glow}`,
        }}
      >
        {/* 卡圖 */}
        <div
          className="shrink-0 w-32 sm:w-40 bg-white rounded-xl border border-[#cfcfcf] overflow-hidden shadow-[0_5px_14px_rgba(0,0,0,0.16)]"
          style={{ boxShadow: `0 5px 18px ${meta.glow}` }}
        >
          <img
            src={getCardImagePath(card.id)}
            alt={card.name}
            className="w-full object-cover"
          />
        </div>

        {/* 名稱 + 稀有度 */}
        <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#565656]">
            CARD · #{String(card.id).padStart(3, "0")}
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-[#050505] leading-tight">
            {card.name}
          </h3>
          <div className="flex justify-center sm:justify-start">
            <RarityBadge rarity={card.rarity} size="lg" />
          </div>
        </div>
      </div>

      {/* 卡牌效果 */}
      <section>
        <SectionTitle>卡牌效果</SectionTitle>
        <div className="border border-[#cfcfcf] rounded-xl p-4 bg-[#f7f7f4] shadow-[0_2px_0_rgba(0,0,0,0.06)] flex gap-3">
          <Zap className="w-5 h-5 text-[#050505] shrink-0 mt-0.5" strokeWidth={2.4} />
          <p className="text-sm text-[#333] leading-relaxed flex-1">
            {card.effect}
          </p>
        </div>
      </section>

      {/* 稀有度說明 */}
      <section>
        <SectionTitle>稀有度說明</SectionTitle>
        <div className="border border-[#cfcfcf] rounded-xl p-4 bg-white shadow-[0_2px_0_rgba(0,0,0,0.06)] space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#565656]">等級</span>
            <span className="text-sm font-black text-[#050505]">
              {meta.tier} / 4
            </span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((tier) => (
              <div
                key={tier}
                className="flex-1 h-1.5 rounded-full"
                style={{
                  background: tier <= meta.tier ? meta.color : "#e8e8e8",
                  boxShadow: tier <= meta.tier ? `0 0 6px ${meta.glow}` : "none",
                }}
              />
            ))}
          </div>
          <p className="text-xs text-[#565656] leading-relaxed pt-2">
            {rarityDescription(card.rarity)}
          </p>
        </div>
      </section>
    </div>
  )
}

function rarityDescription(rarity: Rarity): string {
  switch (rarity) {
    case "common":
      return "常見的入門級寶石,容易在抽卡或日常任務中取得,適合新手組牌。"
    case "rare":
      return "稀有等級寶石,具有較強的單體技能效果,通常需透過進階卡包獲得。"
    case "epic":
      return "史詩等級寶石,擁有改變戰局的關鍵技能,是中後期牌組的核心。"
    case "legendary":
      return "傳說等級寶石,極為罕見,擁有獨特的全場性效果與絢麗的視覺特效。"
  }
}

function RarityContent() {
  const fourC = [
    {
      letter: "C",
      title: "Color · 顏色",
      desc: "顏色越純淨、飽和度越高的寶石價值越高。Aurayale 中分為冷色(藍/綠)、暖色(紅/黃)與中性(白/黑),每種色系有獨立的稀有曲線。",
    },
    {
      letter: "C",
      title: "Cut · 切工",
      desc: "切工決定光線折射的角度與火彩。遊戲中切工越精細的寶石,在戰鬥中觸發特效的機率越高。",
    },
    {
      letter: "C",
      title: "Clarity · 淨度",
      desc: "淨度衡量寶石內部包裹體與表面瑕疵的稀少程度。淨度越高的寶石可承載的附魔等級越高。",
    },
    {
      letter: "C",
      title: "Carat · 克拉",
      desc: "克拉指寶石的重量(體積)。同等品質下,克拉越大價值呈幾何級數成長,但也意味著更高的能量消耗。",
    },
  ]

  return (
    <div className="space-y-5">
      <section>
        <SectionTitle>寶石稀有度的 4C 標準</SectionTitle>
        <p className="text-xs text-[#565656] mb-4 leading-relaxed">
          Aurayale 沿用真實寶石業界的 4C 評鑑系統,綜合判定卡片的稀有度與市場價值。
        </p>

        <div className="space-y-3">
          {fourC.map((c, idx) => (
            <div
              key={idx}
              className="border border-[#cfcfcf] rounded-xl p-3 sm:p-4 bg-[#f7f7f4] flex gap-3 sm:gap-4 items-start shadow-[0_2px_0_rgba(0,0,0,0.06)]"
            >
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#050505] text-white rounded-lg flex items-center justify-center font-black text-lg sm:text-xl shadow-[0_2px_0_rgba(0,0,0,0.18)]">
                {c.letter}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base font-black uppercase tracking-wider text-[#050505] mb-1">
                  {c.title}
                </div>
                <div className="text-xs sm:text-sm text-[#333] leading-relaxed">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>稀有度級別</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(["common", "rare", "epic", "legendary"] as Rarity[]).map((r) => {
            const meta = RARITY_META[r]
            return (
              <div
                key={r}
                className="border border-[#cfcfcf] rounded-lg bg-white p-2 sm:p-3 text-center shadow-[0_2px_0_rgba(0,0,0,0.06)]"
              >
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-1.5"
                  style={{ background: meta.color, boxShadow: `0 0 6px ${meta.glow}` }}
                />
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#050505]">
                  {meta.label}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function ShopContent() {
  return (
    <div className="space-y-5">
      <section>
        <SectionTitle>寶石商店</SectionTitle>
        <p className="text-xs text-[#565656] leading-relaxed">
          官方寶石商店即將開放。屆時可使用遊戲內貨幣或鏈上代幣,直接購買限定寶石、皮膚與升級素材。
        </p>
      </section>

      <div className="border border-dashed border-[#cfcfcf] rounded-xl p-6 sm:p-8 bg-[#f7f7f4] text-center">
        <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-[#050505]" strokeWidth={1.6} />
        <div className="text-sm sm:text-base font-black uppercase tracking-wider text-[#050505] mb-1">
          Coming Soon
        </div>
        <div className="text-xs text-[#565656] leading-relaxed">
          商店功能尚在開發中,敬請期待。
        </div>
        <div className="mt-4 inline-block bg-[#ffc100] text-[#050505] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
          ETA · 2026 Q3
        </div>
      </div>
    </div>
  )
}
