import { useState, type ReactNode } from "react";
import { LandingNavbar } from "./LandingNavbar";
import { MobileMenu } from "./MobileMenu";
import { LandingFooter } from "./LandingFooter";

type ActivePage = "aurayale" | "contact";
type FooterVariant = "default" | "aurayale" | "contact";

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

  return (
    <div className="landing-page font-body antialiased min-h-screen flex flex-col">
      <LandingNavbar activePage={activePage} onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <MobileMenu
        isOpen={mobileMenuOpen}
        activePage={activePage}
        onClose={() => setMobileMenuOpen(false)}
      />
      <main className="flex-grow">{children}</main>
      <LandingFooter variant={footerVariant ?? (activePage === "aurayale" ? "aurayale" : activePage === "contact" ? "contact" : "default")} />
    </div>
  );
}
