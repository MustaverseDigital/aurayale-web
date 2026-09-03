import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LandingNavbar } from "./LandingNavbar";
import { MobileMenu } from "./MobileMenu";
import { LandingFooter } from "./LandingFooter";

type ActivePage = "home" | "aurayale" | "contact";
type FooterVariant = "default" | "aurayale" | "contact";

/**
 * 行銷頁外殼。
 *
 * 除了導覽與頁尾，這裡負責整站共用的兩層裝置：
 * - .mv-rails：固定在畫面上的左右格線，位置貼齊 .mv-container 的內容邊界。
 *   各區塊 rule 兩端的定位十字會剛好落在這兩條線上，版面因此有骨架。
 * - .mv-grain：固定顆粒層。刻意用 fixed + pointer-events:none，
 *   捲動時不會觸發重繪（放在可捲動容器上會直接吃掉手機幀數）。
 *
 */
export function LandingLayout({
  activePage,
  footerVariant,
  children,
}: {
  activePage: ActivePage;
  footerVariant?: FooterVariant;
  children: ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="landing-page min-h-screen flex flex-col">
      <a className="mv-skip" href="#main">
        {t("site.a11y.skipToContent")}
      </a>

      <div className="mv-rails" aria-hidden="true">
        <div className="mv-rails__inner">
          <span />
        </div>
      </div>
      <div className="mv-grain" aria-hidden="true" />

      <LandingNavbar activePage={activePage} onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <MobileMenu
        isOpen={mobileMenuOpen}
        activePage={activePage}
        onClose={() => setMobileMenuOpen(false)}
      />
      <main id="main" className="flex-grow relative z-10">
        {children}
      </main>
      <LandingFooter
        variant={
          footerVariant ??
          (activePage === "aurayale"
            ? "aurayale"
            : activePage === "contact"
            ? "contact"
            : "default")
        }
      />
    </div>
  );
}
