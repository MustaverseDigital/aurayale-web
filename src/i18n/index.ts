import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import zhTW from "./locales/zh-TW"
import en from "./locales/en"

export const SUPPORTED_LOCALES = ["zh-TW", "en"] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: SupportedLocale = "zh-TW"
export const LOCALE_STORAGE_KEY = "aurayale_locale"

function readInitialLocale(): SupportedLocale {
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
    lng: readInitialLocale(),
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
    returnNull: false,
    react: { useSuspense: false },
  })
}

export default i18n
