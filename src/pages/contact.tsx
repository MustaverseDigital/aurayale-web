import { LandingLayout } from "../components/landing/LandingLayout";
import { Mail, Twitter, Youtube, MessageCircle } from "lucide-react";

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
                    <Twitter className="w-5 h-5 text-white" />
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
                    <MessageCircle className="w-5 h-5 text-[#5865F2]" />
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
                    <Youtube className="w-5 h-5 text-[#FF0000]" />
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
