import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import zhTW from "./locales/zh-TW"
import en from "./locales/en"

export const SUPPORTED_LOCALES = ["zh-TW", "en"] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: SupportedLocale = "zh-TW"
export const LOCALE_STORAGE_KEY = "aurayale_locale"

/** 讀取使用者先前選擇的語系；SSR 環境或無紀錄時回傳預設值。 */
export function readStoredLocale(): SupportedLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (saved && (SUPPORTED_LOCALES as readonly string[]).includes(saved)) {
      return saved as SupportedLocale
    }
  } catch {
    // ignore (private mode / storage disabled)
  }
  return DEFAULT_LOCALE
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      "zh-TW": { translation: zhTW },
      en: { translation: en },
    },
    // 一律以 DEFAULT_LOCALE 初始化。
    // 行銷頁是靜態預先渲染的，伺服器端讀不到 localStorage；若在這裡就套用
    // 使用者語系，client 會渲染出與 server HTML 不同的文字而發生 hydration
    // mismatch。改由 _app 掛載後再切換（見 applyStoredLocale）。
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
    returnNull: false,
    react: { useSuspense: false },
  })
}

/** 於 client 掛載後套用已儲存的語系。在 hydration 完成後呼叫。 */
export function applyStoredLocale() {
  const stored = readStoredLocale()
  if (stored !== i18n.language) {
    void i18n.changeLanguage(stored)
  }
}

export default i18n
