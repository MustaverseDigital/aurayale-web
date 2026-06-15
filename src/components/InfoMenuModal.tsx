import { useState, useEffect, useRef, type ComponentType } from "react"
import { useRouter } from "next/router"
import { X, Gamepad2, BookOpen, Gem, ShoppingBag, ArrowLeft, Zap, Loader2, Palette, Diamond, Sparkles, Scale, Gift, ImageOff } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useInfoPanelLayout } from "../hooks/useInfoPanelLayout"
import { LanguageSwitcher } from "./LanguageSwitcher"

const CARD_IMAGE_BASE = "https://res.cloudinary.com/djpxpezra/image/upload"

const CARD_IMAGE_URLS: Record<number, string> = {
  1:  `${CARD_IMAGE_BASE}/v1777194740/AuraGem_v4/001_00_d4xvfw.png`,
  2:  `${CARD_IMAGE_BASE}/v1777194746/AuraGem_v4/002_00_qugosq.png`,
  3:  `${CARD_IMAGE_BASE}/v1777194751/AuraGem_v4/003_00_fdnmsj.png`,
  4:  `${CARD_IMAGE_BASE}/v1777194757/AuraGem_v4/004_00_ejgpda.png`,
  5:  `${CARD_IMAGE_BASE}/v1777194768/AuraGem_v4/005_00_hbx3qj.png`,
  6:  `${CARD_IMAGE_BASE}/v1777194777/AuraGem_v4/006_00_q3gwwt.png`,
  7:  `${CARD_IMAGE_BASE}/v1777194780/AuraGem_v4/007_00_qldnbi.png`,
  8:  `${CARD_IMAGE_BASE}/v1777194786/AuraGem_v4/008_00_xica5e.png`,
  9:  `${CARD_IMAGE_BASE}/v1777194794/AuraGem_v4/009_00_kfovby.png`,
  10: `${CARD_IMAGE_BASE}/v1777194800/AuraGem_v4/010_00_n7m34e.png`,
  11: `${CARD_IMAGE_BASE}/v1777194816/AuraGem_v4/011_00_pzi5as.png`,
  12: `${CARD_IMAGE_BASE}/v1777194818/AuraGem_v4/012_00_ow0o3c.png`,
  13: `${CARD_IMAGE_BASE}/v1777194824/AuraGem_v4/013_00_esyhpj.png`,
  14: `${CARD_IMAGE_BASE}/v1777194829/AuraGem_v4/014_00_bq0kia.png`,
  15: `${CARD_IMAGE_BASE}/v1777194835/AuraGem_v4/015_00_exif8i.png`,
  16: `${CARD_IMAGE_BASE}/v1777194842/AuraGem_v4/016_00_xmsxti.png`,
  17: `${CARD_IMAGE_BASE}/v1777194917/AuraGem_v4/017_00_h1akdh.png`,
  18: `${CARD_IMAGE_BASE}/v1777194922/AuraGem_v4/018_00_ntrn4j.png`,
  19: `${CARD_IMAGE_BASE}/v1777194928/AuraGem_v4/019_00_xogskq.png`,
  20: `${CARD_IMAGE_BASE}/v1777194936/AuraGem_v4/020_00_t8p5sn.png`,
  21: `${CARD_IMAGE_BASE}/v1777194941/AuraGem_v4/021_00_brp5k8.png`,
  22: `${CARD_IMAGE_BASE}/v1777194949/AuraGem_v4/022_00_a36obp.png`,
  23: `${CARD_IMAGE_BASE}/v1777194957/AuraGem_v4/023_00_yrhg5u.png`,
  24: `${CARD_IMAGE_BASE}/v1777195138/AuraGem_v4/024_00_rl09ys.png`,
  25: `${CARD_IMAGE_BASE}/v1777195141/AuraGem_v4/025_00_n1q8gd.png`,
  26: `${CARD_IMAGE_BASE}/v1777195149/AuraGem_v4/026_00_fgg7ax.png`,
  27: `${CARD_IMAGE_BASE}/v1777195283/AuraGem_v4/027_00_wesvva.png`,
  28: `${CARD_IMAGE_BASE}/v1777195291/AuraGem_v4/028_00_sngdxr.png`,
  29: `${CARD_IMAGE_BASE}/v1777195298/AuraGem_v4/029_00_qfmmfg.png`,
  30: `${CARD_IMAGE_BASE}/v1777195305/AuraGem_v4/030_00_lkau6z.png`,
  31: `${CARD_IMAGE_BASE}/v1777195312/AuraGem_v4/031_00_frvy2j.png`,
  32: `${CARD_IMAGE_BASE}/v1777195318/AuraGem_v4/032_00_avsjan.png`,
  33: `${CARD_IMAGE_BASE}/v1777195324/AuraGem_v4/033_00_vapga4.png`,
  34: `${CARD_IMAGE_BASE}/v1777195335/AuraGem_v4/034_00_x93bct.png`,
  35: `${CARD_IMAGE_BASE}/v1777195341/AuraGem_v4/035_00_hczofo.png`,
  36: `${CARD_IMAGE_BASE}/v1777195347/AuraGem_v4/036_00_buooch.png`,
  37: `${CARD_IMAGE_BASE}/v1777195357/AuraGem_v4/037_00_kcz5wd.png`,
  38: `${CARD_IMAGE_BASE}/v1777195356/AuraGem_v4/038_00_r0mvgw.png`,
  39: `${CARD_IMAGE_BASE}/v1777195368/AuraGem_v4/039_00_sacdnn.png`,
  40: `${CARD_IMAGE_BASE}/v1777195374/AuraGem_v4/040_00_hnbate.png`,
}

// 透過 Cloudinary 動態 transformation 取得縮圖：自動轉 WebP/AVIF、自動壓縮畫質、限制寬度
function cardImageUrl(id: number, width: number): string {
  const base = CARD_IMAGE_URLS[id]
  if (!base) return ""
  return base.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`)
}

// 寶石圖片載入逾時門檻：超過此時間仍未載入完成即視為更新失敗，改顯示 placeholder
const CARD_IMAGE_TIMEOUT_MS = 10000

/**
 * 寶石卡圖：在載入期間顯示 spinner，
 * 載入失敗（onError）或逾時（超過 CARD_IMAGE_TIMEOUT_MS 仍未完成）時顯示 placeholder。
 * 須置於 position:relative 且有固定尺寸的父容器中。
 */
function CardImage({
  id,
  width,
  alt,
  imgClassName,
}: {
  id: number
  width: number
  alt: string
  imgClassName?: string
}) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading")
  const url = cardImageUrl(id, width)

  // 卡片切換或來源變更時重置狀態，並啟動逾時計時器
  useEffect(() => {
    if (!url) {
      setStatus("error")
      return
    }
    setStatus("loading")
    const timer = setTimeout(() => {
      // 僅在仍處於 loading 時才判定為失敗，避免覆蓋已載入/已失敗的狀態
      setStatus((s) => (s === "loading" ? "error" : s))
    }, CARD_IMAGE_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [url])

  if (status === "error") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[#f0f0ee] text-[#9a9a9a]">
        <ImageOff className="w-1/3 h-1/3 max-w-[32px] max-h-[32px]" strokeWidth={1.8} />
        <span className="text-[9px] sm:text-[10px] font-bold text-center px-1 leading-tight">
          {t("infoMenu.encyclopedia.imageFailed")}
        </span>
      </div>
    )
  }

  return (
    <>
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f7f7f4]">
          <Loader2 className="w-1/4 h-1/4 max-w-[28px] max-h-[28px] text-[#565656] animate-spin" strokeWidth={2.2} />
        </div>
      )}
      <img
        src={url}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={`${imgClassName ?? ""} transition-opacity duration-200 ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
      />
    </>
  )
}

const PANEL_EDGE_MARGIN = 8

interface InfoMenuModalProps {
  isOpen: boolean
  onClose: () => void
}

type CategoryId = "event" | "gameplay" | "encyclopedia" | "rarity" | "shop"
type Rarity = "common" | "rare" | "epic" | "legendary"

interface Category {
  id: CategoryId
  labelKey: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
}

const categories: Category[] = [
  { id: "event",        labelKey: "infoMenu.categories.event",        icon: Gift },
  { id: "gameplay",     labelKey: "infoMenu.categories.gameplay",     icon: Gamepad2 },
  { id: "encyclopedia", labelKey: "infoMenu.categories.encyclopedia", icon: BookOpen },
  { id: "rarity",       labelKey: "infoMenu.categories.rarity",       icon: Gem },
  { id: "shop",         labelKey: "infoMenu.categories.shop",         icon: ShoppingBag },
]

/* ═══════════════════════════════════════════════
 * 卡片資料表(40 張寶石)
 * 名稱/效果改由 i18n 字典 (cards.{id}.name/effect) 取得,此處只保留 id 與 rarity。
 * ═══════════════════════════════════════════════ */

interface CardInfo {
  id: number
  rarity: Rarity
}

const RARITY_META: Record<Rarity, { label: string; color: string; glow: string; tier: number }> = {
  common:    { label: "Common",    color: "#9a9a9a", glow: "rgba(154,154,154,0.5)", tier: 1 },
  rare:      { label: "Rare",      color: "#3b82f6", glow: "rgba(59,130,246,0.5)",  tier: 2 },
  epic:      { label: "Epic",      color: "#8b5cf6", glow: "rgba(139,92,246,0.5)",  tier: 3 },
  legendary: { label: "Legendary", color: "#ffc100", glow: "rgba(255,193,0,0.6)",   tier: 4 },
}

const CARD_DATA: CardInfo[] = [
  { id: 1,  rarity: "common" },
  { id: 2,  rarity: "common" },
  { id: 3,  rarity: "common" },
  { id: 4,  rarity: "common" },
  { id: 5,  rarity: "common" },
  { id: 6,  rarity: "common" },
  { id: 7,  rarity: "common" },
  { id: 8,  rarity: "common" },
  { id: 9,  rarity: "common" },
  { id: 10, rarity: "common" },
  { id: 11, rarity: "rare" },
  { id: 12, rarity: "rare" },
  { id: 13, rarity: "rare" },
  { id: 14, rarity: "rare" },
  { id: 15, rarity: "rare" },
  { id: 16, rarity: "rare" },
  { id: 17, rarity: "rare" },
  { id: 18, rarity: "epic" },
  { id: 19, rarity: "epic" },
  { id: 20, rarity: "epic" },
  { id: 21, rarity: "epic" },
  { id: 22, rarity: "epic" },
  { id: 23, rarity: "legendary" },
  { id: 24, rarity: "legendary" },
  { id: 25, rarity: "common" },
  { id: 26, rarity: "common" },
  { id: 27, rarity: "common" },
  { id: 28, rarity: "common" },
  { id: 29, rarity: "common" },
  { id: 30, rarity: "common" },
  { id: 31, rarity: "rare" },
  { id: 32, rarity: "rare" },
  { id: 33, rarity: "rare" },
  { id: 34, rarity: "rare" },
  { id: 35, rarity: "rare" },
  { id: 36, rarity: "epic" },
  { id: 37, rarity: "epic" },
  { id: 38, rarity: "epic" },
  { id: 39, rarity: "legendary" },
  { id: 40, rarity: "legendary" },
]

const cardMap = new Map(CARD_DATA.map((c) => [c.id, c]))

/* ═══════════════════════════════════════════════
 * 主 Modal
 * ═══════════════════════════════════════════════ */

export function InfoMenuModal({ isOpen, onClose }: InfoMenuModalProps) {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<CategoryId>("event")
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null)
  const layout = useInfoPanelLayout()
  const router = useRouter()

  // 桌機版面板的拖曳位置(null = 使用 layout 預設位置)
  const [userPosition, setUserPosition] = useState<{ left: number; top: number } | null>(null)
  // 桌機版面板不透明度(10 ~ 100,最低 10 避免找不到面板)
  const [opacity, setOpacity] = useState(100)
  // 拖曳狀態
  const [isDragging, setIsDragging] = useState(false)
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

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

  // 視窗大小或 layout 尺寸變動時,把使用者拖曳後的位置 clamp 回畫面內
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!layout.isSidePanel) return
    setUserPosition((p) => {
      if (!p) return p
      const maxLeft = Math.max(window.innerWidth - layout.panelWidth - PANEL_EDGE_MARGIN, PANEL_EDGE_MARGIN)
      const maxTop = Math.max(window.innerHeight - layout.panelHeight - PANEL_EDGE_MARGIN, PANEL_EDGE_MARGIN)
      const newLeft = Math.min(Math.max(p.left, PANEL_EDGE_MARGIN), maxLeft)
      const newTop = Math.min(Math.max(p.top, PANEL_EDGE_MARGIN), maxTop)
      if (newLeft === p.left && newTop === p.top) return p
      return { left: newLeft, top: newTop }
    })
  }, [layout.isSidePanel, layout.panelWidth, layout.panelHeight])

  // 拖曳處理(僅在桌機版啟用)
  useEffect(() => {
    if (!isDragging) return
    if (typeof window === "undefined") return

    const handleMove = (clientX: number, clientY: number) => {
      const maxLeft = Math.max(window.innerWidth - layout.panelWidth - PANEL_EDGE_MARGIN, PANEL_EDGE_MARGIN)
      const maxTop = Math.max(window.innerHeight - layout.panelHeight - PANEL_EDGE_MARGIN, PANEL_EDGE_MARGIN)
      const left = Math.min(
        Math.max(clientX - dragOffsetRef.current.x, PANEL_EDGE_MARGIN),
        maxLeft,
      )
      const top = Math.min(
        Math.max(clientY - dragOffsetRef.current.y, PANEL_EDGE_MARGIN),
        maxTop,
      )
      setUserPosition({ left, top })
    }

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY)
    const onMouseUp = () => setIsDragging(false)
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        e.preventDefault()
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    const onTouchEnd = () => setIsDragging(false)

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    document.addEventListener("touchmove", onTouchMove, { passive: false })
    document.addEventListener("touchend", onTouchEnd)
    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
      document.removeEventListener("touchmove", onTouchMove)
      document.removeEventListener("touchend", onTouchEnd)
    }
  }, [isDragging, layout.panelWidth, layout.panelHeight])

  // 返回前頁:優先使用瀏覽器歷史,若無歷史則 fallback 到平台首頁
  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }
    router.push("/platform")
  }

  if (!isOpen) return null

  const activeLabel = t(categories.find((c) => c.id === activeCategory)?.labelKey ?? "")
  const selectedCard = selectedCardId ? cardMap.get(selectedCardId) : null
  const selectedCardName = selectedCard ? t(`cards.${selectedCard.id}.name`) : ""

  const effectiveLeft = userPosition?.left ?? layout.panelLeft
  const effectiveTop = userPosition?.top ?? layout.panelTop

  const startDragFromHeader = (clientX: number, clientY: number) => {
    dragOffsetRef.current = {
      x: clientX - effectiveLeft,
      y: clientY - effectiveTop,
    }
    setIsDragging(true)
  }

  // ── 桌機版:右側面板(可拖曳、可調整不透明度,避免遮擋中央遊戲) ──
  if (layout.isSidePanel) {
    return (
      <div
        className="fixed z-[75] pointer-events-none"
        style={{
          left: `${effectiveLeft}px`,
          top: `${effectiveTop}px`,
          width: `${layout.panelWidth}px`,
          height: `${layout.panelHeight}px`,
          opacity: opacity / 100,
          transition: isDragging ? "none" : "opacity 120ms linear",
        }}
      >
        <div
          className="bg-white border border-[#050505] rounded-2xl w-full h-full shadow-[0_10px_28px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden pointer-events-auto info-panel-enter"
        >
          {/* Header(拖曳把手,標題置中) */}
          <header
            onMouseDown={(e) => {
              // 只在點到 header 本身(非內部按鈕)時觸發拖曳
              if ((e.target as HTMLElement).closest("button")) return
              e.preventDefault()
              startDragFromHeader(e.clientX, e.clientY)
            }}
            onTouchStart={(e) => {
              if ((e.target as HTMLElement).closest("button")) return
              if (!e.touches[0]) return
              startDragFromHeader(e.touches[0].clientX, e.touches[0].clientY)
            }}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              touchAction: "none",
              userSelect: "none",
            }}
            className="border-b border-[#e8e8e8] p-3 flex justify-center items-center bg-white shrink-0 relative"
            aria-label={t("infoMenu.aria.dragPanel")}
          >
            {/* 語言切換(絕對定位於最左側) */}
            <LanguageSwitcher className="absolute left-3 top-1/2 -translate-y-1/2" />

            {/* 置中標題 */}
            <h2 className="text-sm font-black uppercase tracking-wider text-[#050505] truncate text-center px-20">
              {selectedCard ? selectedCardName : activeLabel}
            </h2>

            {/* 收合按鈕(絕對定位於右側) */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#050505] hover:text-[#565656] transition-colors"
              aria-label={t("infoMenu.aria.collapse")}
            >
              <X size={20} />
            </button>

            {/* Diamond separator */}
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-10">
              <div className="w-3 h-3 bg-[#050505] transform rotate-45" />
            </div>
          </header>

          {/* Category Tabs(水平排列以節省寬度) */}
          <nav className="flex gap-1 p-2 border-b border-[#e8e8e8] bg-[#f7f7f4] overflow-x-auto shrink-0">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-to-br from-[#1a1a1a] to-[#050505] text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
                      : "text-[#565656] hover:bg-white hover:text-[#050505]"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#ffc800]" : ""}`}
                    strokeWidth={2.2}
                  />
                  <span>{t(cat.labelKey)}</span>
                </button>
              )
            })}
          </nav>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 bg-white min-h-0">
            {activeCategory === "event" && <EventContent />}
            {activeCategory === "gameplay" && <GameplayContent />}
            {activeCategory === "encyclopedia" && (
              selectedCard
                ? <CardDetail card={selectedCard} onBack={() => setSelectedCardId(null)} />
                : <EncyclopediaContent onCardClick={setSelectedCardId} />
            )}
            {activeCategory === "rarity" && <RarityContent />}
            {activeCategory === "shop" && <ShopContent />}
          </div>

          {/* Footer:返回前頁 + 不透明度調整 */}
          <footer className="border-t border-[#e8e8e8] p-2 bg-[#f7f7f4] shrink-0 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleGoBack}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-[#050505] hover:bg-white border border-[#cfcfcf] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.4} />
              <span>{t("infoMenu.actions.backToPreviousPage")}</span>
            </button>

            {/* 不透明度滑桿 */}
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#565656] shrink-0">
                {t("infoMenu.actions.opacity")}
              </span>
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="flex-1 accent-[#050505] cursor-pointer"
                aria-label={t("infoMenu.aria.opacity")}
              />
              <span className="text-[10px] font-black tabular-nums text-[#050505] w-9 text-right">
                {opacity}%
              </span>
            </div>
          </footer>
        </div>
      </div>
    )
  }

  // ── 行動裝置 / 窄螢幕:全畫面 Modal ──
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[75]">
      {/*
        固定高度:採 h-[85vh] + max-h(safety),內容區 overflow-y-auto。
        切 Tab 時整體外殼尺寸不變,只內容捲軸內捲 → 避免畫面跳動。
        外層改為純 flex-col:頂部一條合併後的 Header,下方為側欄 + 內容(行動裝置直立、平板以上水平)。
      */}
      <div className="bg-white border border-[#050505] rounded-2xl w-full max-w-3xl shadow-[0_10px_28px_rgba(0,0,0,0.16)] h-[85vh] max-h-[640px] flex flex-col overflow-hidden">
        {/* ───── 合併後的頂部 Header(橫跨整個 Modal,標題置中對齊) ───── */}
        <header className="border-b border-[#e8e8e8] p-3 sm:p-4 flex justify-center items-center bg-white relative shrink-0">
          {/* 語言切換(絕對定位於最左側) */}
          <LanguageSwitcher className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2" />

          {/* 置中標題 */}
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#050505] truncate text-center px-20 sm:px-24">
            {selectedCard ? selectedCardName : activeLabel}
          </h2>

          {/* 關閉按鈕(絕對定位於右側) */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#050505] hover:text-[#565656] transition-colors"
            aria-label={t("infoMenu.aria.close")}
          >
            <X size={20} className="sm:hidden" />
            <X size={24} className="hidden sm:block" />
          </button>

          {/* Diamond separator */}
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-10">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#050505] transform rotate-45" />
          </div>
        </header>

        {/* ───── Header 下方:側欄 + 內容(行動裝置直立、平板以上水平) ───── */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-0">
          {/* Sidebar(僅放分類與返回前頁,brand header 已移除) */}
          <aside className="sm:w-52 sm:h-full border-b sm:border-b-0 sm:border-r border-[#e8e8e8] bg-[#f7f7f4] flex flex-col shrink-0">
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
                        ? "bg-gradient-to-br from-[#1a1a1a] to-[#050505] text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
                        : "text-[#565656] hover:bg-white hover:text-[#050505]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? "text-[#ffc800]" : ""}`}
                      strokeWidth={2.2}
                    />
                    <span>{t(cat.labelKey)}</span>
                  </button>
                )
              })}

              {/* 返回前頁 */}
              <button
                type="button"
                onClick={handleGoBack}
                className="shrink-0 sm:shrink sm:mt-auto flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold text-[#565656] hover:bg-white hover:text-[#050505] transition-colors whitespace-nowrap sm:border-t sm:border-[#e8e8e8] sm:pt-3 sm:mt-3"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" strokeWidth={2.2} />
                <span>{t("infoMenu.actions.backToPreviousPage")}</span>
              </button>
            </nav>
          </aside>

          {/* Content body(已不再需要第二個 Header) */}
          <section className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white min-h-0">
              {activeCategory === "event" && <EventContent />}
              {activeCategory === "gameplay" && <GameplayContent />}
              {activeCategory === "encyclopedia" && (
                selectedCard
                  ? <CardDetail card={selectedCard} onBack={() => setSelectedCardId(null)} />
                  : <EncyclopediaContent onCardClick={setSelectedCardId} />
              )}
              {activeCategory === "rarity" && <RarityContent />}
              {activeCategory === "shop" && <ShopContent />}
            </div>
          </section>
        </div>
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

function EventContent() {
  const { t } = useTranslation()
  const howToItems = t("infoMenu.event.howToItems", { returnObjects: true }) as string[]
  const rewardItems = t("infoMenu.event.rewardItems", { returnObjects: true }) as string[]

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 活動標題 + 狀態徽章 */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <SectionTitle>{t("infoMenu.event.title")}</SectionTitle>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ffc100] text-[#050505] shrink-0 -mt-2 sm:-mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#050505] animate-pulse" />
            {t("infoMenu.event.badge")}
          </span>
        </div>
        <p className="text-sm text-[#333] leading-relaxed">
          {t("infoMenu.event.description")}
        </p>
      </section>

      {/* 活動截圖 */}
      <div className="relative w-full rounded-xl overflow-hidden">
        <img
          src="/img/activity_1.png"
          alt={t("infoMenu.event.title")}
          className="w-full h-auto object-cover rounded-xl"
        />
      </div>

      {/* 如何參與 */}
      <section>
        <SectionTitle>{t("infoMenu.event.howToTitle")}</SectionTitle>
        <ol className="space-y-2 text-sm text-[#333] leading-relaxed list-decimal list-inside marker:text-[#050505] marker:font-black">
          {howToItems.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ol>
      </section>

      {/* 獎勵內容 */}
      <section>
        <SectionTitle>{t("infoMenu.event.rewardTitle")}</SectionTitle>
        <div className="border border-[#cfcfcf] rounded-xl p-4 bg-[#f7f7f4] shadow-[0_2px_0_rgba(0,0,0,0.06)] space-y-2">
          {rewardItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-[#333]">
              <Gift className="w-4 h-4 text-[#ffc100] shrink-0 mt-0.5" strokeWidth={2.2} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 備注 */}
      <p className="text-[10px] text-[#9a9a9a] leading-relaxed border-t border-[#e8e8e8] pt-3">
        {t("infoMenu.event.note")}
      </p>
    </div>
  )
}

function GameplayContent() {
  const { t } = useTranslation()
  const flowItems = t("infoMenu.gameplay.flow.items", { returnObjects: true }) as string[]
  const mechanicsItems = t("infoMenu.gameplay.coreMechanics.items", {
    returnObjects: true,
  }) as Array<{ t: string; d: string }>

  return (
    <div className="space-y-5 sm:space-y-6">
      <section>
        <SectionTitle>{t("infoMenu.gameplay.whatIsAurayale.title")}</SectionTitle>
        <p className="text-sm text-[#333] leading-relaxed">
          {t("infoMenu.gameplay.whatIsAurayale.body")}
        </p>
      </section>

      <section>
        <SectionTitle>{t("infoMenu.gameplay.flow.title")}</SectionTitle>
        <ol className="space-y-2 text-sm text-[#333] leading-relaxed list-decimal list-inside marker:text-[#050505] marker:font-black">
          {flowItems.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ol>
      </section>

      <section>
        <SectionTitle>{t("infoMenu.gameplay.coreMechanics.title")}</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
          {mechanicsItems.map((item) => (
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
  const { t } = useTranslation()
  return (
    <div className="space-y-5">
      <section>
        <SectionTitle>{t("infoMenu.encyclopedia.title")}</SectionTitle>
        <p className="text-xs text-[#565656] mb-3 leading-relaxed">
          {t("infoMenu.encyclopedia.hint")}
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
          {CARD_DATA.map((card) => {
            const meta = RARITY_META[card.rarity]
            const name = t(`cards.${card.id}.name`)
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onCardClick(card.id)}
                className="group bg-white border border-[#cfcfcf] rounded-lg overflow-hidden shadow-[0_3px_10px_rgba(0,0,0,0.08)] hover:shadow-[0_5px_14px_rgba(0,0,0,0.16)] hover:border-[#050505] hover:scale-[1.03] transition-all relative text-left"
                aria-label={t("infoMenu.aria.viewCardDetail", { name })}
              >
                {/* 稀有度色條 */}
                <div className="h-1" style={{ background: meta.color, boxShadow: `0 0 8px ${meta.glow}` }} />
                <div className="relative w-full aspect-[1136/1600] bg-white overflow-hidden">
                  <CardImage
                    id={card.id}
                    width={300}
                    alt={name}
                    imgClassName="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
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

function CardDetail({ card, onBack }: { card: CardInfo; onBack: () => void }) {
  const { t } = useTranslation()
  const meta = RARITY_META[card.rarity]
  const name = t(`cards.${card.id}.name`)
  const effect = t(`cards.${card.id}.effect`)

  return (
    <div className="space-y-5">
      {/* 返回圖鑑按鈕(放在內容區頂部,不擠在 header) */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#565656] hover:bg-[#f7f7f4] hover:text-[#050505] border border-[#cfcfcf] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2.4} />
        <span>{t("infoMenu.aria.backToEncyclopedia")}</span>
      </button>

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
        <div className="relative shrink-0 w-32 sm:w-40 aspect-[1136/1600] overflow-hidden rounded-lg">
          <CardImage
            id={card.id}
            width={500}
            alt={name}
            imgClassName="absolute inset-0 w-full h-full object-contain"
          />
        </div>

        {/* 名稱 + 稀有度 */}
        <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#565656]">
            {t("infoMenu.cardDetail.cardLabel")} · #{String(card.id).padStart(3, "0")}
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-[#050505] leading-tight">
            {name}
          </h3>
          <div className="flex justify-center sm:justify-start">
            <RarityBadge rarity={card.rarity} size="lg" />
          </div>
        </div>
      </div>

      {/* 卡牌效果 */}
      <section>
        <SectionTitle>{t("infoMenu.cardDetail.effect")}</SectionTitle>
        <div className="border border-[#cfcfcf] rounded-xl p-4 bg-[#f7f7f4] shadow-[0_2px_0_rgba(0,0,0,0.06)] flex gap-3">
          <Zap className="w-5 h-5 text-[#050505] shrink-0 mt-0.5" strokeWidth={2.4} />
          <p className="text-sm text-[#333] leading-relaxed flex-1">
            {effect}
          </p>
        </div>
      </section>

      {/* 稀有度說明 */}
      <section>
        <SectionTitle>{t("infoMenu.cardDetail.rarityExplanation")}</SectionTitle>
        <div className="border border-[#cfcfcf] rounded-xl p-4 bg-white shadow-[0_2px_0_rgba(0,0,0,0.06)] space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#565656]">
              {t("infoMenu.cardDetail.tier")}
            </span>
            <span className="text-sm font-black text-[#050505]">
              {t("infoMenu.cardDetail.tierOfFour", { tier: meta.tier })}
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
            {t(`infoMenu.rarity.descriptions.${card.rarity}`)}
          </p>
        </div>
      </section>
    </div>
  )
}

// 4C 對應的主題圖示(順序需與 i18n 字典的 fourC 一致:Color / Cut / Clarity / Carat)
const FOUR_C_ICONS = [Palette, Diamond, Sparkles, Scale]

function RarityContent() {
  const { t } = useTranslation()
  const fourC = t("infoMenu.rarity.fourC", { returnObjects: true }) as Array<{
    title: string
    desc: string
  }>

  return (
    <div className="space-y-5">
      <section>
        <SectionTitle>{t("infoMenu.rarity.fourCTitle")}</SectionTitle>
        <p className="text-xs text-[#565656] mb-4 leading-relaxed">
          {t("infoMenu.rarity.fourCIntro")}
        </p>

        <div className="space-y-3">
          {fourC.map((c, idx) => {
            const Icon = FOUR_C_ICONS[idx] ?? Gem
            return (
              <div
                key={idx}
                className="border border-[#cfcfcf] rounded-xl p-3 sm:p-4 bg-[#f7f7f4] flex gap-3 sm:gap-4 items-start shadow-[0_2px_0_rgba(0,0,0,0.06)]"
              >
                <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#1a1a1a] to-[#050505] rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#ffc800]" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base font-black uppercase tracking-wider text-[#050505] mb-1">
                    {c.title}
                  </div>
                  <div className="text-xs sm:text-sm text-[#333] leading-relaxed">{c.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <SectionTitle>{t("infoMenu.rarity.levelsTitle")}</SectionTitle>
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
  const { t } = useTranslation()
  return (
    <div className="space-y-5">
      <section>
        <SectionTitle>{t("infoMenu.shop.title")}</SectionTitle>
        <p className="text-xs text-[#565656] leading-relaxed">
          {t("infoMenu.shop.body")}
        </p>
      </section>

      <div className="border border-dashed border-[#cfcfcf] rounded-xl p-6 sm:p-8 bg-[#f7f7f4] text-center">
        <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-[#050505]" strokeWidth={1.6} />
        <div className="text-sm sm:text-base font-black uppercase tracking-wider text-[#050505] mb-1">
          {t("infoMenu.shop.comingSoon")}
        </div>
        <div className="text-xs text-[#565656] leading-relaxed">
          {t("infoMenu.shop.devNotice")}
        </div>
        <div className="mt-4 inline-block bg-[#ffc100] text-[#050505] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
          {t("infoMenu.shop.eta")}
        </div>
      </div>
    </div>
  )
}
