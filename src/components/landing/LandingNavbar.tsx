import Link from "next/link";
import { useRouter } from "next/router";
import { useLogin } from "../../hooks/useLogin";

type ActivePage = "home" | "aurayale" | "contact";

export function LandingNavbar({
  activePage,
  onOpenMobileMenu,
}: {
  activePage: ActivePage;
  onOpenMobileMenu: () => void;
}) {
  const router = useRouter();
  const { login, logout, authenticated, ready } = useLogin({ redirectTo: null, autoProcess: true });

  const navItems: { label: string; href: string; key: ActivePage }[] = [
    // { label: "Home", href: "/landing", key: "home" },
    { label: "Aurayale", href: "/aurayale", key: "aurayale" },
    { label: "Contact", href: "/contact", key: "contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 h-20 flex items-center">
      <div className="w-full max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-16">
            <Link className="flex items-center gap-3 group" href="/landing">
              <img src="/images/Logo.svg" alt="Mustaverse" style={{ width: 150 }} />
            </Link>
            <nav className="hidden md:flex items-center gap-10">
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
            {ready && authenticated ? (
              <>
                <button
                  onClick={() => router.push("/platform")}
                  className="cursor-pointer hidden md:flex items-center justify-center px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:brightness-110 transition-all shadow-lg shadow-primary/25"
                >
                  Enter App
                </button>
                <button
                  onClick={() => logout()}
                  className="cursor-pointer hidden md:flex items-center justify-center px-6 py-2.5 text-xs font-bold uppercase tracking-widest border border-white/20 text-white/70 rounded-lg hover:bg-white/5 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => login()}
                className="cursor-pointer hidden md:flex items-center justify-center px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:brightness-110 transition-all shadow-lg shadow-primary/25"
              >
                Login
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
