import { useState, useRef, useEffect, useCallback } from "react"
import { List } from "lucide-react"

interface FloatingMenuButtonProps {
  onClick: () => void
  /** 是否顯示。建議:當有其他 modal 開啟時隱藏避免遮擋 */
  visible?: boolean
}

const STORAGE_KEY = "aurayale_floating_menu_position"
const BUTTON_SIZE = 56
const EDGE_PADDING = 12
const DRAG_THRESHOLD = 4 // px,超過才視為拖曳(避免單擊誤判)

interface Position {
  x: number
  y: number
}

/**
 * 螢幕右側的可自由拖曳懸浮按鈕。
 * 點擊時呼叫 onClick;拖曳超過閾值的點擊會被忽略。
 * 位置會持久化到 localStorage。
 */
export function FloatingMenuButton({ onClick, visible = true }: FloatingMenuButtonProps) {
  const [position, setPosition] = useState<Position | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const didDragRef = useRef(false)
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 })
  const startPosRef = useRef<Position>({ x: 0, y: 0 })

  // 初始化位置:讀 localStorage 或預設右側垂直置中
  useEffect(() => {
    if (typeof window === "undefined") return

    const clamp = (p: Position): Position => ({
      x: Math.min(Math.max(p.x, EDGE_PADDING), window.innerWidth - BUTTON_SIZE - EDGE_PADDING),
      y: Math.min(Math.max(p.y, EDGE_PADDING), window.innerHeight - BUTTON_SIZE - EDGE_PADDING),
    })

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
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

    setPosition(clamp({
      x: window.innerWidth - BUTTON_SIZE - EDGE_PADDING,
      y: window.innerHeight / 2 - BUTTON_SIZE / 2,
    }))
  }, [])

  // 視窗 resize 時把按鈕約束回畫面內
  useEffect(() => {
    if (!position) return
    const onResize = () => {
      setPosition((p) => {
        if (!p) return p
        return {
          x: Math.min(Math.max(p.x, EDGE_PADDING), window.innerWidth - BUTTON_SIZE - EDGE_PADDING),
          y: Math.min(Math.max(p.y, EDGE_PADDING), window.innerHeight - BUTTON_SIZE - EDGE_PADDING),
        }
      })
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [position])

  // 持久化位置
  useEffect(() => {
    if (position) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(position))
      } catch {
        // ignore
      }
    }
  }, [position])

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
      x = Math.max(EDGE_PADDING, Math.min(window.innerWidth - BUTTON_SIZE - EDGE_PADDING, x))
      y = Math.max(EDGE_PADDING, Math.min(window.innerHeight - BUTTON_SIZE - EDGE_PADDING, y))
      setPosition({ x, y })
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
  }, [isDragging])

  if (!position || !visible) return null

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
        width: `${BUTTON_SIZE}px`,
        height: `${BUTTON_SIZE}px`,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
      className={`fixed z-[55] bg-white/25 backdrop-blur-md text-white border border-white/50 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.35)] hover:bg-white hover:text-[#050505] hover:border-white transition-colors select-none active:scale-95`}
      aria-label="開啟資訊選單"
    >
      <List className="w-6 h-6 pointer-events-none" strokeWidth={2.4} />
    </button>
  )
}
