import { useRouter } from "next/router"
import { useTranslation } from "react-i18next"
import { ChevronLeft } from "lucide-react"

interface ExitGameButtonProps {
  /** 離開後導向的路徑。有帶 onExit 時忽略。 */
  href?: string
  /**
   * 自訂離開行為。用於「回到遊戲內大廳」這種不換頁的情境
   * （呼叫 Unity 的 WebBridge.ReturnToLobby，而非卸載 WebGL 退回網站）。
   * 有帶這個就不會用 href 導頁。
   */
  onExit?: () => void
  /** 是否顯示。資訊面板開啟時建議隱藏，避免與面板重疊 */
  visible?: boolean
  /** 是否在離開前跳出確認（正式遊戲有進度，展場版沒有） */
  confirmBeforeExit?: boolean
}

/**
 * 遊戲畫面左上角的「離開遊戲」按鈕。
 *
 * Unity canvas 佔滿整個視窗（fixed, z-index 1）且沒有任何導覽列，
 * 玩家進入後沒有回到官網的出口，只能按瀏覽器上一頁。
 * 這顆按鈕提供固定的退出路徑，位置避開 9:16 canvas 中央的操作區。
 */
export function ExitGameButton({ href, onExit, visible = true, confirmBeforeExit = false }: ExitGameButtonProps) {
  const router = useRouter()
  const { t } = useTranslation()

  if (!visible) return null

  const handleExit = () => {
    if (confirmBeforeExit && !window.confirm(t("exitGame.confirm"))) return
    if (onExit) {
      onExit()
      return
    }
    if (href) void router.push(href)
  }

  return (
    <button
      type="button"
      onClick={handleExit}
      aria-label={t("exitGame.ariaLabel")}
      className="fixed top-3 left-3 z-[56] flex items-center gap-1.5 pl-2 pr-3.5 py-2 rounded-full bg-black/45 backdrop-blur-md border border-white/25 text-white/90 text-xs font-bold hover:bg-black/70 hover:text-white hover:border-white/40 active:scale-95 transition-all select-none"
      style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
    >
      <ChevronLeft size={16} className="shrink-0" />
      {t("exitGame.label")}
    </button>
  )
}
