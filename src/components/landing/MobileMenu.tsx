import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { useLogin } from "../../hooks/useLogin";
import { LandingLanguageSwitcher } from "./LandingLanguageSwitcher";
import { AURAYALE_SECTIONS, scrollToAurayaleSection } from "./aurayaleSections";

type ActivePage = "home" | "aurayale" | "contact";

const navItems: {
  /** i18n key，於 render 時翻譯（模組層無法呼叫 hook） */
  labelKey: string;
  href: string;
  key: ActivePage;
}[] = [{ labelKey: "site.nav.contact", href: "/contact", key: "contact" }];

/**
 * 行動版選單。與桌機同一套語彙：直角、髮絲線分隔、等寬大寫，
 * 當前頁用左側一條金色細線標示（整站唯一會出現主色的導覽狀態）。
 */
export function MobileMenu({
  isOpen,
  activePage,
  onClose,
}: {
  isOpen: boolean;
  activePage: ActivePage;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  // 與 LandingNavbar 一致：autoProcess 讓登入完成後跑 processLogin
  // （取 Aura token、抓寶石與牌組）。維持 false 的話 processLogin 不會執行，
  // 等於登入了卻沒建立 session。
  const { login, logout, authenticated, ready } = useLogin({ autoProcess: true });
  const router = useRouter();

  return (
    <div
      className={`fixed inset-0 z-60 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-line-2 bg-ink-1 transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-[var(--mv-nav-h)] shrink-0 items-center justify-between border-b border-line-1 px-6">
          <Link href="/landing" onClick={onClose}>
            <img src="/images/Logo.svg" alt="Mustaverse" className="h-6 w-auto" />
          </Link>
          <button
            onClick={onClose}
            aria-label={t("site.a11y.closeMenu")}
            className="-mr-2 cursor-pointer p-2 text-fg-3 transition-colors hover:text-fg-1"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex flex-grow flex-col overflow-y-auto">
          <Link
            className={`flex items-center border-b border-line-1 px-6 py-5 text-lead font-medium tracking-tight transition-colors ${
              activePage === "aurayale"
                ? "border-l-2 border-l-primary text-fg-1"
                : "text-fg-2 hover:bg-white/[0.03] hover:text-fg-1"
            }`}
            href="/aurayale"
            onClick={onClose}
          >
            Aurayale
          </Link>
          <div className="border-b border-line-1 py-2">
            {AURAYALE_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onClose();
                  scrollToAurayaleSection(router, s.id);
                }}
                className="mv-label block w-full cursor-pointer py-3 pl-10 pr-6 text-left transition-colors hover:text-fg-1"
              >
                {s.label}
              </button>
            ))}
          </div>

          {navItems.map((item) => (
            <Link
              key={item.key}
              className={`flex items-center border-b border-line-1 px-6 py-5 text-lead font-medium tracking-tight transition-colors ${
                activePage === item.key
                  ? "border-l-2 border-l-primary text-fg-1"
                  : "text-fg-2 hover:bg-white/[0.03] hover:text-fg-1"
              }`}
              href={item.href}
              onClick={onClose}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="shrink-0 border-t border-line-1 p-6">
          {ready && authenticated ? (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="mv-btn mv-btn--ghost mv-btn--sm w-full"
            >
              {t("site.nav.logout")}
            </button>
          ) : (
            <button
              onClick={() => {
                login();
                onClose();
              }}
              className="mv-btn mv-btn--ghost mv-btn--sm w-full"
            >
              {t("site.nav.login")}
            </button>
          )}
          <div className="mt-6 flex justify-center">
            <LandingLanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
