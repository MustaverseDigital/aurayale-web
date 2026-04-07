import { LandingLayout } from "../components/landing/LandingLayout";
import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <LandingLayout activePage="contact">
      <section className="relative py-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left: Title + Form */}
            <div className="flex flex-col gap-10">
              <div className="space-y-6">
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Let&apos;s build the{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-primary to-purple-400">
                    Future Gaming
                  </span>{" "}
                  together.
                </h1>
                <p className="text-slate-400 text-lg max-w-lg leading-relaxed font-light">
                  Reach out to Mustaverse Studio for collaboration, inquiries, or just to say hello. We are building
                  the future of XR and Web3 gaming.
                </p>
              </div>
              <form className="space-y-6 max-w-lg" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400" htmlFor="name">Name</label>
                    <input className="landing-input-field" id="name" placeholder="John Doe" type="text" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400" htmlFor="org">Organization</label>
                    <input className="landing-input-field" id="org" placeholder="Company Ltd." type="text" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400" htmlFor="email">Email</label>
                  <input className="landing-input-field" id="email" placeholder="john@example.com" type="email" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400" htmlFor="message">Description</label>
                  <textarea
                    className="landing-input-field resize-none"
                    id="message"
                    placeholder="Tell us about your project..."
                    rows={4}
                  />
                </div>
                <button
                  className="w-full md:w-auto px-10 py-4 bg-primary hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group shadow-[0_20px_50px_rgba(99,102,241,0.3)]"
                  type="submit"
                >
                  Send Message
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </form>
            </div>

            {/* Right: Image + Social Cards */}
            <div className="flex flex-col justify-between gap-12">
              <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden group glass-panel p-2">
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent z-10 opacity-60 rounded-[2rem]" />
                <img
                  alt="Abstract golden 3D geometric shapes"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 rounded-[1.5rem]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuABNNkvFd_UHddMZowmHzL2nbk_78Q4-SeXQPKIb8WkOulgkw_PlmShI5GXeUm7ntN1mcEJnNWl2gPLYbMayAte3kNSMNqP-3zABLEfdJggpiEZs1Q91coAoNXCgxTYVSsIQ_p9MWa9krWPHeRE9N07woX4cn9PodQfQ0JFe9obhuRZb7cNVrDnBRtHtjkaUKemV5T9yVwLi3j1MlIl0raHE1hHBBXbZOiK3LYK44c75sKcF5ZXvi3DXMZXamSNnCfjZIz2p8T_ueM"
                />
                <div className="absolute bottom-0 left-0 p-8 z-20">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-md mb-4">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold text-primary tracking-wide uppercase">Open for Deals</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 font-display">Connect Across the Metaverse</h3>
                  <p className="text-slate-400 text-sm font-light">Join our community of creators and gamers.</p>
                </div>
              </div>

              {/* Social Links Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <a
                  className="social-card"
                  href="https://x.com/MustaverseLab"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-sm">X</span>
                </a>
                <a
                  className="social-card"
                  href="https://discord.gg/xjNWXdYzFB"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="size-10 rounded-xl bg-[#5865F2]/10 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-sm">Discord</span>
                </a>
                <a
                  className="social-card"
                  href="https://youtu.be/UFAOxXTXFuo"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="size-10 rounded-xl bg-[#FF0000]/10 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-sm">YouTube</span>
                </a>
                <a
                  className="social-card"
                  href="mailto:mustaverse.studio@gmail.com"
                >
                  <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-medium text-sm">Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
