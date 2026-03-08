import Link from "next/link";
import { useLogin } from "../../hooks/useLogin";

type ActivePage = "home" | "aurayale" | "contact";

const navItems: {
  label: string;
  href: string;
  key: ActivePage;
  icon: string;
}[] = [
  // { label: "Home", href: "/landing", key: "home", icon: "home" },
  { label: "Aurayale", href: "/aurayale", key: "aurayale", icon: "diamond" },
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
  const { login, logout, authenticated, ready } = useLogin({ redirectTo: null, autoProcess: true });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-0 right-0 w-full max-w-sm h-full bg-background-dark/95 backdrop-blur-2xl border-l border-white/5 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <Link href="/landing" onClick={onClose}>
            <img src="/images/Logo.svg" alt="" style={{ width: 120 }} />
          </Link>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-6 flex-grow">
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
