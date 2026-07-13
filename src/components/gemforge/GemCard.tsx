import { ELEMENT_META, RARITY_META, type ForgedGem, type GemStats } from "@/lib/gemForge";
import { GemVisual } from "./GemVisual";

const STAT_LABELS: { key: keyof GemStats; label: string }[] = [
  { key: "power", label: "力量" },
  { key: "guard", label: "守護" },
  { key: "spirit", label: "靈性" },
];

const STAT_MAX = 12; // 能量條滿格基準（legendary 單項理論上限附近）

/**
 * 寶石卡卡面 — 3:4 直式、截圖導向設計（Game Night 分享用）。
 * 只吃 ForgedGem，不碰任何 context / 儲存，方便在成品頁與收藏頁重用。
 */
export function GemCard({ gem }: { gem: ForgedGem }) {
  const element = ELEMENT_META[gem.element];
  const rarity = RARITY_META[gem.rarity];

  return (
    <div
      className="gem-card relative w-full max-w-85 mx-auto aspect-3/4 rounded-2xl overflow-hidden flex flex-col"
      style={{
        // 元素色注入 CSS 變數，卡內裝飾統一取用
        ["--gem-color" as string]: element.color,
        ["--gem-color-soft" as string]: element.colorSoft,
        ["--gem-rarity-color" as string]: rarity.color,
      }}
    >
      {/* 頂部：稀有度 + 元素 */}
      <div className="flex items-center justify-between px-5 pt-4">
        <span
          className="text-[11px] font-bold tracking-[0.25em] uppercase"
          style={{ color: rarity.color }}
        >
          {rarity.label}
        </span>
        <span
          className="gem-element-chip text-[11px] font-bold tracking-[0.2em]"
          style={{ color: element.color, borderColor: `${element.color}88` }}
        >
          {element.label}
        </span>
      </div>

      {/* 寶石本體 */}
      <div className="flex-1 flex items-center justify-center py-2">
        <GemVisual gem={gem} size={170} />
      </div>

      {/* 名稱 */}
      <div className="px-5 text-center">
        <h2 className="gem-serif text-2xl font-bold text-[#f2ede2] tracking-wide">
          {gem.name}
        </h2>
        <p className="text-[11px] text-[#8d978f] mt-1 tracking-[0.15em]">{element.blurb}</p>
      </div>

      {/* 數值 */}
      <div className="px-6 pt-3 space-y-1.5">
        {STAT_LABELS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-[11px] text-[#8d978f] w-8 shrink-0 tracking-widest">
              {label}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (gem.stats[key] / STAT_MAX) * 100)}%`,
                  background: `linear-gradient(90deg, ${element.colorSoft}, ${element.color})`,
                }}
              />
            </div>
            <span
              className="text-xs font-bold w-5 text-right"
              style={{ color: element.color, fontVariantNumeric: "tabular-nums" }}
            >
              {gem.stats[key]}
            </span>
          </div>
        ))}
      </div>

      {/* 故事 */}
      <p className="px-6 pt-3 pb-3 text-[11px] leading-relaxed text-[#a8b0a8] line-clamp-3">
        {gem.story}
      </p>

      {/* 卡腳 */}
      <div className="gem-card-footer px-5 py-2.5 flex items-center justify-between">
        <span className="text-[9px] tracking-[0.3em] uppercase text-[#6b7568]">
          Aurayale · 寶石鍛造所
        </span>
        <span className="text-[9px] text-[#6b7568]" style={{ fontVariantNumeric: "tabular-nums" }}>
          No.{gem.id.slice(-4).toUpperCase()}
        </span>
      </div>
    </div>
  );
}
