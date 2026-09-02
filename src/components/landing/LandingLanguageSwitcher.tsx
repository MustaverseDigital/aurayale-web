import { useTranslation } from "react-i18next"
import {
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "../../i18n"

interface Props {
  className?: string
}

/**
 * 行銷頁專用的語言切換（深色底）。
 *
 * 與 components/LanguageSwitcher 的差別只在配色：
 * 那一支是給白底的資訊面板用的（深色文字），放在深色的官網上會看不見。
 */
export function LandingLanguageSwitcher({ className }: Props) {
  const { i18n } = useTranslation()
  const current = (SUPPORTED_LOCALES as readonly string[]).includes(i18n.language)
    ? (i18n.language as SupportedLocale)
    : "zh-TW"

  const setLocale = (next: SupportedLocale) => {
    if (next === current) return
    void i18n.changeLanguage(next)
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      // ignore (private mode / storage disabled)
    }
  }

  // 主色留給每頁唯一的主要 CTA，語系切換的 active 只用最亮的灰階表示。
  const base = "mv-label cursor-pointer px-1 transition-colors"
  const active = "text-fg-1"
  const inactive = "hover:text-fg-1"

  return (
    <div className={`flex items-center gap-1.5 select-none ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`${base} ${current === "en" ? active : inactive}`}
        aria-pressed={current === "en"}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-fg-3/60 text-[10px] leading-none">/</span>
      <button
        type="button"
        onClick={() => setLocale("zh-TW")}
        className={`${base} ${current === "zh-TW" ? active : inactive}`}
        aria-pressed={current === "zh-TW"}
        aria-label="切換為繁體中文"
      >
        中
      </button>
    </div>
  )
}
