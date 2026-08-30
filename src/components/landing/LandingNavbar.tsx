import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLogin, POST_LOGIN_BATTLE_ROUTE } from "../../hooks/useLogin";
import { LandingLanguageSwitcher } from "./LandingLanguageSwitcher";
import { AURAYALE_SECTIONS, scrollToAurayaleSection } from "./aurayaleSections";

type ActivePage = "home" | "aurayale" | "contact";

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
    // { label: "Home", href: "/landing", key: "home" },
    { label: t("site.nav.contact"), href: "/contact", key: "contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 h-20 flex items-center">
      <div className="w-full max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-16">
            <Link className="flex items-center gap-3 group" href="/landing">
              <img src="/images/Logo.svg" alt="Mustaverse" style={{ width: 150 }} />
            </Link>
            <nav className="hidden md:flex items-center gap-10">
              {/* Aurayale：hover 彈出選單，列出頁面各 section */}
              <div
                className="relative"
                onMouseEnter={() => setAurayaleOpen(true)}
                onMouseLeave={() => setAurayaleOpen(false)}
              >
                <Link
                  className={activePage === "aurayale" ? "landing-nav-link-active" : "landing-nav-link"}
                  href="/aurayale"
                >
                  Aurayale
                </Link>
                <div
                  className={`absolute left-0 top-full pt-3 w-52 transition-all duration-200 ${
                    aurayaleOpen
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-1 pointer-events-none"
                  }`}
                >
                  <div className="glass-panel border border-white/10 rounded-xl py-2 shadow-2xl shadow-black/40">
                    {AURAYALE_SECTIONS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setAurayaleOpen(false);
                          scrollToAurayaleSection(router, s.id);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
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
                  className={activePage === item.key ? "landing-nav-link-active" : "landing-nav-link"}
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <LandingLanguageSwitcher className="hidden md:flex mr-2" />
            {ready && authenticated ? (
              <>
                <button
                  onClick={() => router.push(POST_LOGIN_BATTLE_ROUTE)}
                  className="cursor-pointer hidden md:flex items-center justify-center px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:brightness-110 transition-all shadow-lg shadow-primary/25"
                >
                  {t("site.nav.enterApp")}
                </button>
                <button
                  onClick={() => logout()}
                  className="cursor-pointer hidden md:flex items-center justify-center px-6 py-2.5 text-xs font-bold uppercase tracking-widest border border-white/20 text-white/70 rounded-lg hover:bg-white/5 transition-all"
                >
                  {t("site.nav.logout")}
                </button>
              </>
            ) : (
              <button
                onClick={() => login()}
                className="cursor-pointer hidden md:flex items-center justify-center px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:brightness-110 transition-all shadow-lg shadow-primary/25"
              >
                {t("site.nav.login")}
              </button>
            )}
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
