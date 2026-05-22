import { useTranslation } from "react-i18next"
import {
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "../i18n"

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
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

  const baseBtn =
    "px-1 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
  const active = "text-[#050505]"
  const inactive = "text-[#a3a3a3] hover:text-[#565656]"

  return (
    <div className={`flex items-center gap-1 select-none ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`${baseBtn} ${current === "en" ? active : inactive}`}
        aria-pressed={current === "en"}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-[#cfcfcf] text-xs leading-none">|</span>
      <button
        type="button"
        onClick={() => setLocale("zh-TW")}
        className={`${baseBtn} ${current === "zh-TW" ? active : inactive}`}
        aria-pressed={current === "zh-TW"}
        aria-label="切換為繁體中文"
      >
        中
      </button>
    </div>
  )
}
