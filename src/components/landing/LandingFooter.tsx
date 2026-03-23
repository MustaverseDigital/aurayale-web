import Link from "next/link";
import { Mail } from "lucide-react";

type FooterVariant = "default" | "aurayale" | "contact";

export function LandingFooter({ variant = "default" }: { variant?: FooterVariant }) {
  return (
    <footer className="relative z-10 bg-background-dark pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <Link className="flex items-center gap-3 group" href="/landing">
                <img src="/images/Logo.svg" alt="" style={{ width: 150 }} />
              </Link>
            </div>
            <p className="text-slate-500 max-w-sm mb-10 leading-relaxed font-light">
              {variant === "aurayale"
                ? "Pioneering the intersection of high-fidelity gaming and decentralized finance."
                : "An advanced development lab specializing in high-fidelity XR environments and sovereign decentralized systems."}
            </p>
            <div className="flex gap-8">
              <a
                className="text-slate-500 hover:text-white transition-colors"
                href="https://x.com/MustaverseLab"
                aria-label="X"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                className="text-slate-500 hover:text-white transition-colors"
                href="https://discord.gg/xjNWXdYzFB"
                aria-label="Discord"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
                </svg>
              </a>
              <a
                className="text-slate-500 hover:text-white transition-colors"
                href="https://youtu.be/UFAOxXTXFuo"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                className="text-slate-500 hover:text-white transition-colors"
                href="mailto:mustaverse.studio@gmail.com"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {variant === "aurayale" ? (
            <>
              <div>
                <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-8">Aurayale</h4>
                <ul className="space-y-4">
                  <li><a className="text-slate-500 hover:text-white transition-colors text-sm font-light" href="#">Game Guide</a></li>
                  <li><a className="text-slate-500 hover:text-white transition-colors text-sm font-light" href="#">Marketplace</a></li>
                  <li><a className="text-slate-500 hover:text-white transition-colors text-sm font-light" href="#">Leaderboard</a></li>
                  <li><a className="text-slate-500 hover:text-white transition-colors text-sm font-light" href="#">Patch Notes</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-8">Legal</h4>
                <ul className="space-y-4">
                  <li><a className="text-slate-500 hover:text-white transition-colors text-sm font-light" href="#">Privacy Policy</a></li>
                  <li><a className="text-slate-500 hover:text-white transition-colors text-sm font-light" href="#">Terms of Service</a></li>
                  <li><a className="text-slate-500 hover:text-white transition-colors text-sm font-light" href="#">Tokenomics</a></li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-8">Studio</h4>
                <ul className="space-y-4">
                  <li><a className="text-slate-500 hover:text-white transition-colors text-sm font-light" href="#">Active Projects</a></li>
                  <li><a className="text-slate-500 hover:text-white transition-colors text-sm font-light" href="#">Ecosystem</a></li>
                  <li><a className="text-slate-500 hover:text-white transition-colors text-sm font-light" href="#">Laboratory</a></li>
                  <li><a className="text-slate-500 hover:text-white transition-colors text-sm font-light" href="#">Press Kit</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-8">Compliance</h4>
                <ul className="space-y-4">
                  <li><a className="text-slate-500 hover:text-white transition-colors text-sm font-light" href="#">Data Sovereignty</a></li>
                  <li><a className="text-slate-500 hover:text-white transition-colors text-sm font-light" href="#">Terms of Access</a></li>
                  <li><a className="text-slate-500 hover:text-white transition-colors text-sm font-light" href="#">Nodes</a></li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">
            &copy; 2026 Mustaverse Studio. All rights reserved.
          </p>
          <div className="flex gap-8">
            {variant === "aurayale" ? (
              <span className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.3em]">
                Status: Operational
              </span>
            ) : variant === "contact" ? (
              <>
                <a className="text-slate-600 hover:text-white text-[10px] uppercase tracking-widest font-bold transition-colors" href="#">
                  Privacy Policy
                </a>
                <a className="text-slate-600 hover:text-white text-[10px] uppercase tracking-widest font-bold transition-colors" href="#">
                  Terms of Service
                </a>
              </>
            ) : (
              <span className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.3em]">
                SECURE_NODE: 0xFF2109
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
