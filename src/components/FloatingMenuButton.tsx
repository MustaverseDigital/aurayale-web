import { useState, useRef, useEffect, useCallback } from "react"

interface FloatingMenuButtonProps {
  onClick: () => void
  /** 是否顯示。建議:當有其他 modal 開啟時隱藏避免遮擋 */
  visible?: boolean
  /**
   * 桌機版的初始定位提示。
   * - 提供時:作為「未儲存過位置」時的預設位置,並改用獨立的 localStorage key,
   *   讓桌機版與行動裝置版的拖曳位置不會互相覆蓋。
   * - 未提供:預設右側垂直置中。
   * 不論是否提供,按鈕一律可拖曳。
   */
  pinned?: { left: number; top: number; size?: number }
}

const STORAGE_KEY = "aurayale_floating_menu_position"
const STORAGE_KEY_PINNED = "aurayale_floating_menu_position_pinned"
const BUTTON_SIZE = 56
const EDGE_PADDING = 12
const DRAG_THRESHOLD = 4 // px,超過才視為拖曳(避免單擊誤判)

interface Position {
  x: number
  y: number
}

/**
 * 可自由拖曳的懸浮按鈕。點擊時呼叫 onClick;拖曳超過閾值的點擊會被忽略。
 * 位置會持久化到 localStorage(桌機 / 行動裝置使用不同 key)。
 */
export function FloatingMenuButton({ onClick, visible = true, pinned }: FloatingMenuButtonProps) {
  const storageKey = pinned ? STORAGE_KEY_PINNED : STORAGE_KEY
  const buttonSize = pinned?.size ?? BUTTON_SIZE

  const [position, setPosition] = useState<Position | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const didDragRef = useRef(false)
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 })
  const startPosRef = useRef<Position>({ x: 0, y: 0 })

  // 初始化位置:讀 localStorage → pinned(若提供) → 預設右側垂直置中
  // 只在 mount 時執行一次;之後 pinned 變動不會重置使用者手動拖曳的位置
  useEffect(() => {
    if (typeof window === "undefined") return

    const clamp = (p: Position): Position => ({
      x: Math.min(Math.max(p.x, EDGE_PADDING), window.innerWidth - buttonSize - EDGE_PADDING),
      y: Math.min(Math.max(p.y, EDGE_PADDING), window.innerHeight - buttonSize - EDGE_PADDING),
    })

    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved) as Position
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          setPosition(clamp(parsed))
          return
        }
      }
    } catch {
      // ignore
    }

    if (pinned) {
      setPosition(clamp({ x: pinned.left, y: pinned.top }))
      return
    }

    setPosition(clamp({
      x: window.innerWidth - buttonSize - EDGE_PADDING,
      y: window.innerHeight / 2 - buttonSize / 2,
    }))
    // 故意只依賴 storageKey/buttonSize;pinned 只用於「第一次初始化」的後備值,
    // 後續拖曳的位置不應因 layout 重算而被覆蓋。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, buttonSize])

  // 視窗 resize 時把按鈕約束回畫面內
  useEffect(() => {
    if (!position) return
    const onResize = () => {
      setPosition((p) => {
        if (!p) return p
        return {
          x: Math.min(Math.max(p.x, EDGE_PADDING), window.innerWidth - buttonSize - EDGE_PADDING),
          y: Math.min(Math.max(p.y, EDGE_PADDING), window.innerHeight - buttonSize - EDGE_PADDING),
        }
      })
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [position, buttonSize])

  // 持久化位置
  useEffect(() => {
    if (position) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(position))
      } catch {
        // ignore
      }
    }
  }, [position, storageKey])

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!position) return
      setIsDragging(true)
      didDragRef.current = false
      startPosRef.current = { x: clientX, y: clientY }
      dragOffsetRef.current = {
        x: clientX - position.x,
        y: clientY - position.y,
      }
    },
    [position]
  )

  // 拖曳結束時吸附到最近的左/右邊緣,避免擋到遊戲畫面中央區
  const snapToHorizontalEdge = useCallback(
    (pos: Position): Position => {
      if (typeof window === "undefined") return pos
      const buttonCenterX = pos.x + buttonSize / 2
      const screenCenterX = window.innerWidth / 2
      const snappedX =
        buttonCenterX < screenCenterX
          ? EDGE_PADDING
          : window.innerWidth - buttonSize - EDGE_PADDING
      return { x: snappedX, y: pos.y }
    },
    [buttonSize]
  )

  // 全域 mousemove / touchmove
  useEffect(() => {
    if (!isDragging) return

    const handleMove = (clientX: number, clientY: number) => {
      const dx = Math.abs(clientX - startPosRef.current.x)
      const dy = Math.abs(clientY - startPosRef.current.y)
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        didDragRef.current = true
      }

      let x = clientX - dragOffsetRef.current.x
      let y = clientY - dragOffsetRef.current.y
      x = Math.max(EDGE_PADDING, Math.min(window.innerWidth - buttonSize - EDGE_PADDING, x))
      y = Math.max(EDGE_PADDING, Math.min(window.innerHeight - buttonSize - EDGE_PADDING, y))
      setPosition({ x, y })
    }

    const finishDrag = () => {
      setIsDragging(false)
      if (didDragRef.current) {
        setPosition((p) => (p ? snapToHorizontalEdge(p) : p))
      }
    }

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY)
    const onMouseUp = () => finishDrag()
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        e.preventDefault()
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    const onTouchEnd = () => finishDrag()

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
  }, [isDragging, buttonSize, snapToHorizontalEdge])

  if (!visible) return null
  if (!position) return null

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        handleStart(e.clientX, e.clientY)
      }}
      onTouchStart={(e) => {
        if (e.touches[0]) {
          handleStart(e.touches[0].clientX, e.touches[0].clientY)
        }
      }}
      onClick={(e) => {
        if (didDragRef.current) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
        onClick()
      }}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        transition: isDragging
          ? "none"
          : "left 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.15s, color 0.15s, border-color 0.15s",
      }}
      className="fixed z-[55] bg-white/20 backdrop-blur-xl backdrop-saturate-150 border border-white/40 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.35)] hover:bg-white hover:border-white select-none active:scale-95"
      aria-label="開啟資訊選單"
    >
      <img
        src="/img/Logo_s.svg"
        alt=""
        draggable={false}
        className="w-8 h-8 pointer-events-none"
      />
    </button>
  )
}
