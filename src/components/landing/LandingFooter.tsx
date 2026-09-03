import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Mail, MapPin } from "lucide-react";
import { LandingLanguageSwitcher } from "./LandingLanguageSwitcher";
import { Rule } from "./primitives";

type FooterVariant = "default" | "aurayale" | "contact";

const CONTACT_EMAIL = "mustaverse.studio@gmail.com";

const OFFICES = [
  {
    name: "digiBlock C 數位創新基地",
    city: "台北",
    map: "https://www.google.com/maps/search/?api=1&query=digiBlock+C+數位創新基地",
  },
  {
    name: "桃園安東青創基地",
    city: "桃園",
    map: "https://www.google.com/maps/search/?api=1&query=桃園安東青創基地",
  },
];

// 品牌標記沒有圖示庫版本（lucide 不收商標），維持內嵌路徑。
const SOCIAL_LINKS = [
  {
    label: "X",
    href: "https://x.com/MustaverseLab",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "Discord",
    href: "https://discord.gg/xjNWXdYzFB",
    path: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z",
  },
  {
    label: "YouTube",
    href: "https://youtu.be/UFAOxXTXFuo",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

/**
 * 頁尾。與各區塊同一套骨架：上緣一條帶定位十字的線，欄位靠 12 欄格線切，
 * 欄與欄之間用垂直髮絲線分隔（桌機才畫，手機收成單欄）。
 */
export function LandingFooter({ variant = "default" }: { variant?: FooterVariant }) {
  const { t } = useTranslation();
  return (
    <footer className="relative z-10 bg-ink-1">
      <div className="mv-container">
        <Rule />
        <div className="mv-inset grid grid-cols-1 gap-12 pt-14 pb-12 md:grid-cols-12 md:gap-0">
          {/* 品牌 */}
          <div className="md:col-span-5 md:pr-10">
            <Link className="mb-6 inline-block" href="/landing">
              <img src="/images/Logo.svg" alt="Mustaverse Studio" className="h-7 w-auto" />
            </Link>
            <p className="mv-body mv-body--sm max-w-[36ch]">
              {variant === "aurayale"
                ? t("site.footer.taglineAurayale")
                : t("site.footer.taglineDefault")}
            </p>
          </div>

          {/* 聯絡 */}
          <div className="md:col-span-4 md:border-l md:border-line-1 md:pl-10">
            <h2 className="mv-label mb-5">{t("site.footer.contact")}</h2>
            <a
              className="mv-link inline-flex items-center gap-2 text-caption whitespace-nowrap"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              <Mail className="h-4 w-4 shrink-0 text-fg-3" strokeWidth={1.5} />
              {CONTACT_EMAIL}
            </a>
            <div className="mt-7 flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  className="flex h-9 w-9 items-center justify-center border border-line-1 text-fg-3 transition-colors hover:border-line-3 hover:text-fg-1"
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* 據點 */}
          <div className="md:col-span-3 md:border-l md:border-line-1 md:pl-10">
            <h2 className="mv-label mb-5">{t("site.footer.offices")}</h2>
            <address className="flex flex-col gap-5 not-italic">
              {OFFICES.map((office) => (
                <a
                  key={office.name}
                  className="group flex items-start gap-2 text-caption"
                  href={office.map}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-fg-3 transition-colors group-hover:text-fg-1"
                    strokeWidth={1.5}
                  />
                  <span>
                    <span className="block text-fg-2 transition-colors group-hover:text-fg-1">
                      {office.name}
                    </span>
                    <span className="mv-label mt-1 block">{office.city}</span>
                  </span>
                </a>
              ))}
            </address>
          </div>
        </div>

        <Rule />
        <div className="mv-inset flex flex-col items-start justify-between gap-5 py-7 sm:flex-row sm:items-center">
          {/* 手機上語系切換與版權各自佔一行：擠在同一行會讓版權文字斷在「版權所／有」。 */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <LandingLanguageSwitcher />
            <p className="mv-label normal-case tracking-[0.06em]">
              {t("site.footer.rights")}
            </p>
          </div>
          {variant === "aurayale" || variant === "contact" ? (
            <div className="flex gap-8">
              <a className="mv-label transition-colors hover:text-fg-1" href="#">
                {t("site.footer.privacy")}
              </a>
              <a className="mv-label transition-colors hover:text-fg-1" href="#">
                {t("site.footer.terms")}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
