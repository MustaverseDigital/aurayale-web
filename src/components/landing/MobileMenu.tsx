import Link from "next/link";
import { useRouter } from "next/router";
import { useLogin } from "../../hooks/useLogin";
import { AURAYALE_SECTIONS, scrollToAurayaleSection } from "./aurayaleSections";

type ActivePage = "home" | "aurayale" | "contact";

const navItems: {
  label: string;
  href: string;
  key: ActivePage;
  icon: string;
}[] = [
  // { label: "Home", href: "/landing", key: "home", icon: "home" },
  { label: "Contact", href: "/contact", key: "contact", icon: "mail" },
];

export function MobileMenu({
  isOpen,
  activePage,
  onClose,
}: {
  isOpen: boolean;
  activePage: ActivePage;
  onClose: () => void;
}) {
  const { login, logout, authenticated, ready } = useLogin({ redirectTo: null, autoProcess: false });
  const router = useRouter();

  return (
    <div
      className={`fixed inset-0 z-[60] transition-visibility ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute top-0 right-0 w-full max-w-sm h-full bg-background-dark/95 backdrop-blur-2xl border-l border-white/5 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <Link href="/landing" onClick={onClose}>
            <img src="/images/Logo.svg" alt="" style={{ width: 120 }} />
          </Link>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-6 flex-grow overflow-y-auto">
          {/* Aurayale：標題連結 + 各 section 子項 */}
          <Link
            className={
              activePage === "aurayale"
                ? "flex items-center gap-4 px-4 py-4 rounded-xl text-white bg-primary/10 border border-primary/20"
                : "flex items-center gap-4 px-4 py-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            }
            href="/aurayale"
            onClick={onClose}
          >
            <span
              className={`material-symbols-outlined text-xl ${activePage === "aurayale" ? "text-primary" : ""}`}
            >
              diamond
            </span>
            <span className="text-sm font-semibold uppercase tracking-widest">Aurayale</span>
          </Link>
          <div className="flex flex-col gap-1 pl-6 mb-1 border-l border-white/10 ml-5">
            {AURAYALE_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onClose();
                  scrollToAurayaleSection(router, s.id);
                }}
                className="text-left px-4 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {s.label}
              </button>
            ))}
            {/* 展覽試玩入口（載入展覽版 Unity build，不需登入） */}
            <Link
              href="/demo"
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-amber-300 hover:text-amber-200 hover:bg-white/5 transition-all"
            >
              <span className="material-symbols-outlined text-base">play_circle</span>
              Demo
            </Link>
          </div>

          {navItems.map((item) => (
            <Link
              key={item.key}
              className={
                activePage === item.key
                  ? "flex items-center gap-4 px-4 py-4 rounded-xl text-white bg-primary/10 border border-primary/20"
                  : "flex items-center gap-4 px-4 py-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              }
              href={item.href}
              onClick={onClose}
            >
              <span
                className={`material-symbols-outlined text-xl ${activePage === item.key ? "text-primary" : ""}`}
              >
                {item.icon}
              </span>
              <span className="text-sm font-semibold uppercase tracking-widest">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5">
          {ready && authenticated ? (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full px-6 py-3 border border-white/20 text-white/70 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                login();
                onClose();
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
