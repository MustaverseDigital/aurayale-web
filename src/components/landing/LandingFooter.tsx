import Link from "next/link";
import { Mail, Youtube, MessageCircle } from "lucide-react";

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
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                className="text-slate-500 hover:text-white transition-colors"
                href="https://youtu.be/UFAOxXTXFuo"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="w-5 h-5" />
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
