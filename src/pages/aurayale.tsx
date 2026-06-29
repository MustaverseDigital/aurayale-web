import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/router";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { MobileMenu } from "../components/landing/MobileMenu";
import { LandingFooter } from "../components/landing/LandingFooter";
import { useLogin } from "../hooks/useLogin";

// Count-up animation hook
function useCountUp(
  target: number,
  options: { duration?: number; delay?: number; decimals?: number; suffix?: string } = {}
) {
  const { duration = 2000, delay = 1000, decimals = 0, suffix = "" } = options;
  const [display, setDisplay] = useState("0" + suffix);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let start: number | null = null;
    let delayTimer: ReturnType<typeof setTimeout>;

    const formatNumber = (n: number) => {
      const fixed = n.toFixed(decimals);
      const [intPart, decPart] = fixed.split(".");
      const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return (decPart ? withCommas + "." + decPart : withCommas) + suffix;
    };

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setDisplay(formatNumber(current));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(formatNumber(target));
      }
    };

    delayTimer = setTimeout(() => {
      rafRef.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay, decimals, suffix]);

  return display;
}

export default function AurayalePage() {
  const router = useRouter();
  const { login, authenticated, ready } = useLogin({ redirectTo: null, autoProcess: false });
  const pendingAdventureRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 從別頁帶 hash 進來時（例如導覽選單點某 section），載入後滾動到對應錨點。
  useEffect(() => {
    if (!router.isReady) return;
    const hash = router.asPath.split("#")[1];
    if (!hash) return;
    // 等內容渲染後再滾動。
    const timer = setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    return () => clearTimeout(timer);
  }, [router.isReady, router.asPath]);

  // Count-up stats
  const gamesPlayed = useCountUp(24792, { delay: 1200, duration: 2000 });
  const inAgents = useCountUp(2499347, { delay: 1350, duration: 2200 });
  const prizePool = useCountUp(24.7, { delay: 1500, duration: 2000, decimals: 1, suffix: "M" });

  useEffect(() => {
    if (pendingAdventureRef.current && ready && authenticated) {
      pendingAdventureRef.current = false;
      router.push("/platform");
    }
  }, [ready, authenticated, router]);

  const handleStartAdventure = () => {
    if (ready && authenticated) {
      router.push("/platform");
    } else {
      pendingAdventureRef.current = true;
      login();
    }
  };

  const handleScroll = useCallback(() => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    const hero = heroRef.current;
    if (!video || !overlay || !hero) return;

    const heroHeight = hero.offsetHeight;
    const scrollY = window.scrollY;
    const progress = Math.min(scrollY / heroHeight, 1);
    const eased = progress * progress;

    video.style.opacity = String(0.7 - eased * 0.3);
    video.style.filter = `blur(${eased * 20}px)`;
    overlay.style.opacity = String(0.3 + eased * 0.45);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Scroll-reveal: Intersection Observer for below-the-fold sections
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const heroStats = [
    { value: gamesPlayed, label: "Games Played" },
    { value: inAgents, label: "In Agents" },
    { value: prizePool, label: "Total Prize Pool" },
  ];

  return (
    <div className="landing-page font-body antialiased min-h-screen flex flex-col">
      {/* Fixed Video Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ opacity: 0.4 }}
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/images/banner.mp4" type="video/mp4" />
        </video>
        <div ref={overlayRef} className="absolute inset-0 bg-background-dark" style={{ opacity: 0.4 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/30 via-transparent to-background-dark/60" />
      </div>

      <LandingNavbar activePage="aurayale" onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <MobileMenu isOpen={mobileMenuOpen} activePage="aurayale" onClose={() => setMobileMenuOpen(false)} />

      <main className="flex-grow relative z-10">
        {/* Hero */}
        <section ref={heroRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] mix-blend-screen" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <div className="hero-enter hero-badge inline-flex items-center gap-3 px-6 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-md mb-12 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-[10px] font-bold text-indigo-300 tracking-[0.3em] uppercase">
                Season 1: Genesis Mint Live
              </span>
            </div>
            <h1 className="hero-enter hero-title font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-8 leading-[1.1] drop-shadow-2xl">
              Rule the Universe<br />
              <span className="text-gradient-landing">One Gem at a Time.</span>
            </h1>
            <div className="hero-enter hero-stats flex flex-wrap items-center justify-center mb-16">
              {/* <div className="flex flex-wrap justify-center gap-14">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="hero-stat-item relative">
                    <div className="text-3xl font-bold text-slate-100 font-display tabular-nums">{stat.value}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-2">{stat.label}</div>
                  </div>
                ))}
              </div> */}
            </div>
            <div className="hero-enter hero-cta flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={handleStartAdventure}
                className="group w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white rounded-full font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] flex items-center justify-center gap-2"
              >
                Start Adventure
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <button className="w-full sm:w-auto px-12 py-4 glass-panel border-white/20 text-white hover:bg-white/5 rounded-full font-bold text-sm uppercase tracking-widest transition-all backdrop-blur-md">
                Watch Trailer
              </button>
            </div>
          </div>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
            <span className="material-symbols-outlined text-primary text-3xl">keyboard_arrow_down</span>
          </div>
        </section>

        {/* Home (game intro) */}
        <section id="home" className="py-32 relative reveal scroll-mt-24">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="relative z-10 order-2 lg:order-1">
                <div className="relative group">
                  <div className="aspect-[4/3] rounded-[2rem] glass-card-deep p-2 relative overflow-visible transform rotate-[-2deg] hover:rotate-0 transition-transform duration-700">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-[40px] z-0" />
                    <div className="relative  w-full rounded-[1.5rem] overflow-hidden">
                      <img
                        alt="Aurayale Gem Universe"
                        className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-1000"
                        src="/images/banner_02.jpg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-60" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative z-10 order-1 lg:order-2">
                <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-6 flex items-center gap-2">
                  <span className="w-8 h-px bg-primary" /> Home
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight leading-tight">
                  Welcome to the{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-slate-200">
                    Gem Universe
                  </span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-6 font-light max-w-lg">
                  Across the vast Gem Universe, challenging powerful guardians on Gem
                  Planets to collect, upgrade, and fuse magical Gem Cards.
                </p>
                <div className="flex gap-4">
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOT Games — 暫時隱藏 */}
        <section id="hot-games" className="hidden py-32 reveal scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className="p-2.5 bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg shadow-primary/20">
                  <span className="text-white material-symbols-outlined block">local_fire_department</span>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight font-display">HOT Games</h2>
              </div>
              <a className="text-slate-400 text-sm hover:text-white flex items-center transition-all font-semibold group" href="#">
                Explore Library
                <span className="material-symbols-outlined text-lg ml-2 transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 reveal-stagger reveal">
              {/* Card 3: Full */}
              <div className="glass-panel rounded-2xl p-7 hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-primary opacity-30 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-bold text-xl text-slate-100 group-hover:text-white transition-colors leading-tight">
                    Beginner&apos;s Arena
                  </h3>
                  <span className="bg-primary/10 text-primary border border-primary/30 text-xs px-3 py-1 rounded-full font-bold">Full</span>
                </div>
                <div className="flex items-center space-x-6 text-sm mb-10">
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300">
                    <span className="text-primary material-symbols-outlined text-xl">emoji_events</span>
                    <span className="font-bold">100</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300">
                    <span className="text-primary material-symbols-outlined text-xl">group</span>
                    <span className="font-bold">20/20</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300">
                    <span className="text-rose-500/80 material-symbols-outlined text-xl">favorite</span>
                    <span className="font-bold">45</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                  <div className="flex gap-2">
                    <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] px-2.5 py-1 rounded font-black uppercase tracking-[0.15em]">Novice</span>
                    <span className="bg-indigo-300/10 text-indigo-300 border border-indigo-300/20 text-[9px] px-2.5 py-1 rounded font-black uppercase tracking-[0.15em]">Ranked</span>
                  </div>
                  <button className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 uppercase tracking-wider hover:brightness-110">
                    Spectate
                  </button>
                </div>
              </div>

              {/* Card 1: Live */}
              <div className="glass-panel rounded-2xl p-7 hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-30 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-bold text-xl text-slate-100 group-hover:text-white transition-colors leading-tight">
                    Aurayale Season 1 Championship
                  </h3>
                  <span className="status-active">
                    <span className="status-dot" /> Live
                  </span>
                </div>
                <div className="flex items-center space-x-6 text-sm mb-10">
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300">
                    <span className="text-primary material-symbols-outlined text-xl">emoji_events</span>
                    <span className="font-bold">6</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300">
                    <span className="text-primary material-symbols-outlined text-xl">group</span>
                    <span className="font-bold">7/12</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300">
                    <span className="text-rose-500/80 material-symbols-outlined text-xl">favorite</span>
                    <span className="font-bold">112</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                  <div className="flex gap-2">
                    <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] px-2.5 py-1 rounded font-black uppercase tracking-[0.15em]">Hot</span>
                    <span className="bg-indigo-300/10 text-indigo-300 border border-indigo-300/20 text-[9px] px-2.5 py-1 rounded font-black uppercase tracking-[0.15em]">Mining</span>
                  </div>
                  <button className="bg-primary/10 border border-primary/30 text-primary text-xs font-bold py-2.5 px-6 rounded-xl transition-all uppercase tracking-wider hover:bg-primary/20 hover:border-primary">
                    Enter Room
                  </button>
                </div>
              </div>

              {/* Card 2: Ended */}
              <div className="glass-panel rounded-2xl p-7 hover:border-slate-500/40 transition-all duration-500 group cursor-pointer relative overflow-hidden opacity-80 hover:opacity-100">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-500/20 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-bold text-xl text-slate-100 transition-colors leading-tight">Weekly Speed Run Event</h3>
                  <span className="bg-black/40 text-slate-500 border border-white/5 text-xs px-3 py-1 rounded-full font-bold">Ended</span>
                </div>
                <div className="flex items-center space-x-6 text-sm mb-10">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-primary/50 material-symbols-outlined text-xl">emoji_events</span>
                    <span className="font-bold">1,200</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-primary/50 material-symbols-outlined text-xl">group</span>
                    <span className="font-bold">50/50</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-rose-500/40 material-symbols-outlined text-xl">favorite</span>
                    <span className="font-bold">89</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                  <div className="flex gap-2">
                    <span className="bg-white/5 text-slate-500 border border-white/10 text-[9px] px-2.5 py-1 rounded font-black uppercase tracking-[0.15em]">Speedrun</span>
                  </div>
                  <button className="bg-white/5 text-slate-500 text-xs font-bold py-2.5 px-6 rounded-xl border border-white/5 cursor-not-allowed uppercase tracking-wider">
                    Closed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Gem Cuts */}
        <section id="gem-cuts" className="py-32 relative bg-white/[0.01] reveal scroll-mt-24">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-6">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Light Strategic Fun
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto font-light">
                10 Aura gem card deck, 9 Rune symbols
              </p>
              <p className="text-slate-400 max-w-xl mx-auto font-light">
                Form your stylish combos and unleash dazzling spells.
              </p>
            </div>
            <div className="flex justify-center items-end py-16 overflow-visible">
              <div className="relative flex items-end justify-center w-full max-w-[700px] mx-auto" style={{ height: 300 }}>
                {[
                  { src: "/images/card_01.png", floatClass: "card-float-1", transform: "translateX(-50%) translateX(calc(-28vw + 40px)) rotate(-15deg)", z: 1 },
                  { src: "/images/card_02.png", floatClass: "card-float-2", transform: "translateX(-50%) translateX(calc(-10vw + 10px)) rotate(-5deg)", z: 2 },
                  { src: "/images/card_03.png", floatClass: "card-float-3", transform: "translateX(-50%) translateX(calc(10vw - 10px)) rotate(5deg)", z: 3 },
                  { src: "/images/card_04.png", floatClass: "card-float-4", transform: "translateX(-50%) translateX(calc(28vw - 40px)) rotate(15deg)", z: 4 },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 bottom-0"
                    style={{ transform: card.transform, transformOrigin: "bottom center", zIndex: card.z }}
                  >
                    <div className={`${card.floatClass} cursor-pointer`}>
                      <img
                        src={card.src}
                        alt={`Card ${String(i + 1).padStart(2, "0")}`}
                        className="fan-card w-[140px] sm:w-[170px] md:w-[220px] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SwUp System */}
        <section id="swup-system" className="py-32 relative overflow-hidden reveal scroll-mt-24">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background-dark z-0" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="glass-panel rounded-[3rem] p-12 md:p-20 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <span className="accent-badge mb-6 inline-flex">SwUp System V1.0</span>
                  <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
                    Empowering<br /> On-Chain Card
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8 font-light">
                    Aura gems are more than just collectibles. 
                  </p>
                  <ul className="space-y-6">
                    <li className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 mt-1">
                        <span className="material-symbols-outlined text-sm text-primary">check</span>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">ERC-1155 Multi-Token Standard</h4>
                        <p className="text-slate-500 text-xs mt-1">Gas-efficient batch transfers and mixed asset types.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 mt-1">
                        <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">Chainlink VRF Integration</h4>
                        <p className="text-slate-500 text-xs mt-1">Verifiable randomness for all gem generation events.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  <img
                    src="/images/banner_03.png"
                    alt="SwUp System"
                    className="w-full h-auto rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Awards */}
        <section id="awards" className="py-24 bg-white/[0.01] border-y border-white/5 reveal scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-12">
              Recognized By Industry Leaders
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-80">
              {[
                { icon: "diamond", name: "ETHGlobal", sub: "Finalist 2024" },
                { icon: "rocket_launch", name: "BYBIT", nameSuffix: "Unleashed", sub: "Grant Recipient" },
                { icon: "hexagon", name: "Avalanche", sub: "AVAX Ecosystem" },
              ].map((award, i) => (
                <div key={award.name} className="flex flex-col items-center gap-2 group cursor-default">
                  {i > 0 && <div className="w-px h-12 bg-white/10 hidden md:block absolute -ml-[calc(50%+3rem)]" />}
                  <span className="material-symbols-outlined text-4xl text-primary/40 group-hover:text-primary transition-colors">
                    {award.icon}
                  </span>
                  <span className="font-display font-bold text-xl tracking-wide text-slate-400 group-hover:text-white transition-colors">
                    {award.name}
                    {award.nameSuffix && <span className="font-light"> {award.nameSuffix}</span>}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-primary/60">{award.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 relative reveal scale-up">
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="glass-panel py-20 px-8 rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(99,102,241,0.15)] bg-gradient-to-b from-white/[0.02] to-transparent">
              <h2 className="font-display text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter">
                Begin Your<br />
                <span className="text-gradient-landing">Galactic Hunt</span>
              </h2>
              <p className="text-slate-400 text-lg mb-12 max-w-lg mx-auto font-light">
                The portal is open. Thousands of gems await discovery. Will you claim the rarest artifacts?
              </p>
              <div className="flex flex-col items-center">
                <button
                  onClick={handleStartAdventure}
                  className="px-16 py-6 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-lg uppercase tracking-widest hover:brightness-110 hover:scale-105 transition-all shadow-[0_0_40px_rgba(99,102,241,0.3)]"
                >
                  Play Now
                </button>
                <p className="mt-6 text-xs text-slate-500 uppercase tracking-wider">Browser &amp; VR Compatible</p>
              </div>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10" />
        </section>
      </main>

      <LandingFooter variant="aurayale" />
    </div>
  );
}
