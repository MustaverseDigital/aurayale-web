import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";
import { useLogin, POST_LOGIN_BATTLE_ROUTE } from "../../hooks/useLogin";
import { LandingLanguageSwitcher } from "./LandingLanguageSwitcher";
import { AURAYALE_SECTIONS, scrollToAurayaleSection } from "./aurayaleSections";

type ActivePage = "home" | "aurayale" | "contact";

/**
 * 行銷頁導覽列。
 *
 * 72px 高（上限 80px），單行不折行，底部一條髮絲線接住頁面格線。
 * 導覽項目走等寬大寫並帶一個 "/" 前綴當分隔，主色只用在「當前頁」的底線；
 * 登入 / 進入應用都是描邊按鈕，把金色留給各頁唯一的主要 CTA。
 */
export function LandingNavbar({
  activePage,
  onOpenMobileMenu,
}: {
  activePage: ActivePage;
  onOpenMobileMenu: () => void;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  // 目前刻意不傳 redirectTo：useLogin 預設為 null，登入完停在原地。
  // 登入本身只負責換 Aura token 與牌組，進遊戲由下方的 Enter App 按鈕
  // 明確觸發（POST_LOGIN_BATTLE_ROUTE = /battle）。
  // 先前預設自動跳轉，但本元件與 MobileMenu、頁面本身會同時掛載多個
  // useLogin 實例，各自跳一次會互相打架。
  const { login, logout, authenticated, ready } = useLogin({ autoProcess: true });
  const [aurayaleOpen, setAurayaleOpen] = useState(false);

  const navItems: { label: string; href: string; key: ActivePage }[] = [
    { label: t("site.nav.contact"), href: "/contact", key: "contact" },
  ];

  return (
    <header className="mv-nav sticky top-0 z-50 w-full border-b border-line-1 bg-ink-1/80 backdrop-blur-xl">
      <div className="mv-container">
        <div className="mv-inset flex h-[var(--mv-nav-h)] items-center justify-between gap-6">
          <div className="flex items-center gap-10 lg:gap-16">
            <Link className="flex shrink-0 items-center" href="/landing">
              <img
                src="/images/Logo.svg"
                alt="Mustaverse"
                className="h-6 w-auto md:h-7"
              />
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              {/* Aurayale：hover 展開頁內 section 清單 */}
              <div
                className="relative"
                onMouseEnter={() => setAurayaleOpen(true)}
                onMouseLeave={() => setAurayaleOpen(false)}
              >
                <Link
                  className={
                    activePage === "aurayale"
                      ? "mv-nav-link mv-nav-link--active"
                      : "mv-nav-link"
                  }
                  href="/aurayale"
                >
                  <span className="mr-1.5 text-fg-3">/</span>
                  Aurayale
                </Link>
                <div
                  className={`absolute left-0 top-full w-56 pt-4 transition-all duration-200 ${
                    aurayaleOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible -translate-y-1 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="border border-line-2 bg-ink-3/95 backdrop-blur-xl">
                    {AURAYALE_SECTIONS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setAurayaleOpen(false);
                          scrollToAurayaleSection(router, s.id);
                        }}
                        className="mv-label block w-full cursor-pointer px-4 py-3 text-left transition-colors hover:bg-white/5 hover:text-fg-1"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.key}
                  className={
                    activePage === item.key
                      ? "mv-nav-link mv-nav-link--active"
                      : "mv-nav-link"
                  }
                  href={item.href}
                >
                  <span className="mr-1.5 text-fg-3">/</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-5">
            <LandingLanguageSwitcher className="hidden md:flex" />
            {ready && authenticated ? (
              <>
                <button
                  onClick={() => router.push(POST_LOGIN_BATTLE_ROUTE)}
                  className="mv-btn mv-btn--ghost mv-btn--sm hidden md:inline-flex"
                >
                  {t("site.nav.enterApp")}
                </button>
                <button
                  onClick={() => logout()}
                  className="mv-label hidden cursor-pointer transition-colors hover:text-fg-1 md:block"
                >
                  {t("site.nav.logout")}
                </button>
              </>
            ) : (
              <button
                onClick={() => login()}
                className="mv-btn mv-btn--ghost mv-btn--sm hidden md:inline-flex"
              >
                {t("site.nav.login")}
              </button>
            )}
            <button
              onClick={onOpenMobileMenu}
              aria-label={t("site.a11y.openMenu")}
              className="-mr-2 cursor-pointer p-2 text-fg-3 transition-colors hover:text-fg-1 md:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
