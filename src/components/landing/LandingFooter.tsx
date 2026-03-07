import Link from "next/link";

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
              <a className="text-slate-500 hover:text-white transition-colors" href="#">
                <span className="material-symbols-outlined text-xl">alternate_email</span>
              </a>
              <a className="text-slate-500 hover:text-white transition-colors" href="#">
                <span className="material-symbols-outlined text-xl">code</span>
              </a>
              <a className="text-slate-500 hover:text-white transition-colors" href="#">
                <span className="material-symbols-outlined text-xl">terminal</span>
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
