import { useEffect, useRef } from "react";
import Link from "next/link";
import { LandingLayout } from "../components/landing/LandingLayout";

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    const heroSection = heroRef.current;
    if (!video || !overlay || !heroSection) return;

    const heroHeight = heroSection.offsetHeight;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / heroHeight, 1);

      // Ease out curve for smoother transition
      const eased = progress * progress;

      const videoOpacity = 0.7 - eased * 0.3;
      const overlayOpacity = 0.3 + eased * 0.45;
      const blurAmount = eased * 20; // 0px → 20px blur

      video.style.opacity = String(videoOpacity);
      video.style.filter = `blur(${blurAmount}px)`;
      overlay.style.opacity = String(overlayOpacity);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const partners = [
    { src: "/images/%20Partners_blockus.svg", alt: "Blockus" },
    { src: "/images/%20Partners_comic.svg", alt: "Comic" },
    { src: "/images/%20Partners_hongwang.svg", alt: "Hongwang" },
    { src: "/images/%20Partners_immutable.svg", alt: "Immutable" },
    { src: "/images/%20Partners_jurassic.svg", alt: "Jurassic" },
    { src: "/images/%20Partners_light.svg", alt: "Light" },
    { src: "/images/%20Partners_united.svg", alt: "United" },
    { src: "/images/%20Partners_z.svg", alt: "Z" },
  ];

  const teamMembers = [
    { name: "Kevin", role: "Founder", img: "/images/w1.png" },
    { name: "Wallce", role: "CTO", img: "/images/w1.png" },
    { name: "Allen", role: "CMP", img: "/images/w1.png" },
    { name: "Aron", role: "Dev.", img: "/images/w1.png" },
    { name: "Owen", role: "Dev.", img: "/images/w1.png" },
    { name: "Benson", role: "Dev.", img: "/images/w1.png" },
    { name: "Mao", role: "Art", img: "/images/w1.png" },
    { name: "Json", role: "TA", img: "/images/w1.png" },
  ];

  return (
    <LandingLayout activePage="home">
      {/* Video Background */}
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
          <source src="/images/home_banner.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay that increases with scroll */}
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-background-dark"
          style={{ opacity: 0.4 }}
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/30 via-transparent to-background-dark/60" />
      </div>
      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden pt-32 pb-40 z-1">
        <div className="absolute inset-0 z-1">
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-12">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-[10px] font-bold text-slate-300 tracking-[0.2em] uppercase">
              Your Best XR Partner
            </span>
          </div>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-white mb-8 leading-[0.95] text-gradient">
            Bring Your Game Into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-primary to-purple-400">
              Next Generation
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Deal your idea, Mustaverse make it success..
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-32 relative z-1">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative z-10">
              <span className="text-primary font-bold tracking-widest text-xs uppercase mb-4 block">
                Our Philosophy
              </span>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                Crafting the <br />Invisible Layer
              </h2>
              <div className="w-12 h-1 bg-gradient-to-r from-primary to-transparent mb-10" />
              <p className="text-slate-300 text-lg leading-relaxed mb-8 font-light">
                Mustaverse Studio functions at the intersection of spatial computing and decentralized
                systems. We architect immersive ecosystems where physical and digital boundaries dissolve.
              </p>
              <div className="grid grid-cols-2 gap-12 mt-12">
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-4xl font-display font-bold text-white mb-1">50+</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Deployments</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-4xl font-display font-bold text-white mb-1">12</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Innovations</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[2rem] overflow-hidden glass-panel p-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-10" />
                <img
                  alt="Advanced conceptual 3D render"
                  className="w-full h-full object-cover rounded-2xl opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuARaEX6v6-TyAUU8ND66RT4iQI-SmhT-ouUkoISE2adJHTi4mn_K4k-RZ6LUOIvVyAb75Ps2TJrevuztLlD35HdTYxWxZ3kWlvkanTSw00JJ6taEoO5-CLiMLoXT85nTFsUbo5GYUMNTPM8Sq60tVXQ8Tsf9sf2QJvYsFrtkKs_25wV2mHF-dilRzogWt7P6lhfM9TMX8p4WxRcPlMcklpqIkUSuhSpR-lX_tDEMfA5AICLRKIEf2PgCrUQEJiYnKNjNRTmetiz5r8"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 glass-panel p-8 rounded-2xl shadow-2xl max-w-[280px] z-20">
                <div className="flex items-center gap-4 mb-4">
                  <span className="material-symbols-outlined text-primary text-4xl">model_training</span>
                  <h4 className="text-white font-bold text-sm tracking-tight">Economic Synthesis</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed uppercase tracking-wider">
                  Algorithmic incentive structures integrated into spatial environments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Competencies */}
      <section className="py-32 bg-white/[0.01] relative z-1">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl font-bold text-white mb-4 tracking-tight">Core Competencies</h2>
            <p className="text-slate-400 max-w-xl mx-auto font-light">
              A multidisciplinary approach to the decentralized spatial web.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "view_in_ar", title: "Spatial XR", desc: "Advanced AR/VR experiences leveraging high-fidelity rendering for industrial simulations and luxury retail showrooms." },
              { icon: "hub", title: "Web3 Infrastructure", desc: "Secure smart contract architecture and sovereign asset ownership layers for the next generation of digital commerce." },
              { icon: "auto_awesome", title: "Real-time Engine", desc: "Harnessing the power of Unreal Engine 5 to create hyper-realistic environments with dynamic lighting and physics." },
            ].map((item) => (
              <div key={item.title} className="glass-card p-10 rounded-3xl group">
                <div className="w-14 h-14 glass-panel rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 font-display">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Ventures / Our Products */}
      <section className="py-32 relative z-1">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Our Products
              </h2>
              <p className="text-slate-400 font-light">
                Internal R&amp;D products currently in early-access phase.
              </p>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Aurayale Card */}
            <div className="group relative rounded-[2.5rem] overflow-hidden glass-panel">
              <div className="aspect-video overflow-hidden">
                <img
                  alt="Aurayale conceptual environment"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-50"
                  src="/images/index_aurayale.jpg"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent flex flex-col justify-end p-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-4xl font-display font-bold text-white">Aurayale</h3>
                  <span className="px-4 py-1.5 glass-panel text-[10px] text-white rounded-full font-bold uppercase tracking-widest">
                    TCG
                  </span>
                </div>
                <p className="text-slate-300 text-base mb-8 font-light max-w-md">
                  Rule the Multiverse - One Gem at a Time.
                </p>
                <Link
                  href="/aurayale"
                  className="w-fit px-8 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-colors"
                >
                  More
                </Link>
              </div>
            </div>
            {/* DEAL Card */}
            <div className="group relative rounded-[2.5rem] overflow-hidden glass-panel">
              <div className="aspect-video overflow-hidden">
                <img
                  alt="DEAL conceptual environment"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-50"
                  src="/images/index_deal.jpg"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent flex flex-col justify-end p-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-4xl font-display font-bold text-white">DEAL</h3>
                  <span className="px-4 py-1.5 glass-panel text-[10px] text-white rounded-full font-bold uppercase tracking-widest">
                    Toolkit
                  </span>
                </div>
                <p className="text-slate-300 text-base mb-8 font-light max-w-md">
                  The Bridge from Tabletop to Digital.
                </p>
                <a
                  href="https://chile109.github.io/DEAL-DOC/"
                  className="w-fit px-8 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-32 relative z-1">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl font-bold text-white mb-4 tracking-tight">Our Team</h2>
            <p className="text-slate-400 font-light">Architects of the next digital frontier.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="group text-center">
                <div className="aspect-square rounded-2xl overflow-hidden mb-4 glass-panel relative">
                  <img
                    alt={member.name}
                    className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
                    src={member.img}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <h3 className="text-base font-bold text-white">{member.name}</h3>
                <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-24 border-t border-white/5 bg-white/[0.01] overflow-hidden relative z-1">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-16">
            Our Partners
          </h3>
        </div>
        <style jsx>{`
          @keyframes marqueeScroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .marquee-track {
            display: flex;
            animation: marqueeScroll 30s linear infinite;
            width: max-content;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
          .partner-logo {
            opacity: 0.35;
            transition: opacity 0.4s ease, filter 0.4s ease, transform 0.4s ease;
            filter: grayscale(100%) brightness(1.5);
          }
          .partner-logo:hover {
            opacity: 1;
            filter: grayscale(0%) brightness(1);
            transform: scale(1.08);
          }
        `}</style>
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background-dark to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background-dark to-transparent z-10 pointer-events-none" />
          {/* Marquee */}
          <div className="marquee-track">
            {/* Set 1 */}
            <div className="flex items-center gap-16 px-8 shrink-0">
              {partners.map((p) => (
                <img key={p.alt} src={p.src} alt={p.alt} className="partner-logo h-32 w-auto cursor-pointer" />
              ))}
            </div>
            {/* Set 2 (duplicate for seamless loop) */}
            <div className="flex items-center gap-16 px-8 shrink-0">
              {partners.map((p) => (
                <img key={`dup-${p.alt}`} src={p.src} alt={p.alt} className="partner-logo h-32 w-auto cursor-pointer" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-background-dark to-background-dark z-1" />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 glass-panel py-24 rounded-[3rem]">
          <h2 className="font-display text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tighter">
            Let&apos;s Define the <br />New Standard
          </h2>
          <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Our team is ready to transform your vision into a production-grade digital reality.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-primary text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-[0_20px_50px_rgba(99,102,241,0.3)]"
          >
            Start Consultation
          </Link>
        </div>
      </section>

    </LandingLayout>
  );
}
