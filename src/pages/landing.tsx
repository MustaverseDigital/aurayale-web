import { useEffect, useRef } from "react";
import Link from "next/link";
import { LandingLayout } from "../components/landing/LandingLayout";
import { useScrollReveal } from "../hooks/useScrollReveal";

/* ─── Reusable Reveal Wrapper ─── */
function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const dirMap = {
    up: "translate3d(0, 48px, 0)",
    left: "translate3d(-48px, 0, 0)",
    right: "translate3d(48px, 0, 0)",
    scale: "scale(0.92)",
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate3d(0,0,0) scale(1)" : dirMap[direction],
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  // 捲動時讓 hero 影片緩慢下沉並加深壓暗，製造景深。
  // 尊重 prefers-reduced-motion：使用者關閉動態時完全不掛監聽。
  useEffect(() => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    const heroSection = heroRef.current;
    if (!video || !overlay || !heroSection) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const heroHeight = heroSection.offsetHeight || 1;
        const progress = Math.min(window.scrollY / heroHeight, 1);

        video.style.transform = `translate3d(0, ${progress * 12}%, 0)`;
        overlay.style.opacity = String(0.9 + progress * 0.1);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
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

  // Our Team 區塊暫時隱藏，資料一併保留以便日後還原
  // const teamMembers = [
  //   { name: "Kevin", role: "Founder", img: "/images/w1.png" },
  //   { name: "Wallce", role: "CTO", img: "/images/w2.png" },
  //   { name: "Allen", role: "CMP", img: "/images/w3.png" },
  //   { name: "Aron", role: "Dev.", img: "/images/w4.png" },
  //   { name: "Owen", role: "Dev.", img: "/images/w5.png" },
  //   { name: "Benson", role: "Dev.", img: "/images/w6.png" },
  //   { name: "Mao", role: "Art", img: "/images/w7.png" },
  //   { name: "Json", role: "TA", img: "/images/w8.png" },
  // ];

  return (
    <LandingLayout activePage="home">
      {/* Hero：以遊戲畫面為主體（參考 Rayark / Skvader 的作品優先結構）， */}
      {/* 影片不再是整頁 fixed 背景，而是 hero 自己的視覺內容。 */}
      <section
        ref={heroRef}
        className="relative overflow-hidden min-h-[100dvh] flex items-end pt-24 pb-20 z-1"
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ opacity: 0.55 }}
            autoPlay
            muted
            loop
            playsInline
            poster="/images/card_layer.jpeg"
          >
            <source src="/images/home_banner.mp4" type="video/mp4" />
          </video>
          {/* 由下往上壓暗，讓文字壓在畫面下緣仍可讀 */}
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/70 to-background-dark/30"
            style={{ opacity: 0.9 }}
          />
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <Reveal delay={0}>
                <p className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-5">
                  Mustaverse Studio
                </p>
              </Reveal>
              <Reveal delay={120}>
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white mb-6 leading-[0.95]">
                  Entertainment and IP,
                  <br />
                  built on cards.
                </h1>
              </Reveal>
              <Reveal delay={240}>
                <p className="text-lg text-slate-300 max-w-xl mb-10 leading-relaxed font-light">
                  We design trading card games and the on-chain worlds around them. Aurayale is ours.
                </p>
              </Reveal>
              <Reveal delay={360}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/aurayale"
                    className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-primary text-background-dark rounded-[12px] font-bold hover:bg-secondary transition-all active:scale-[0.98]"
                  >
                    Play Aurayale
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-10 py-4 rounded-[12px] font-bold text-white border border-white/20 hover:bg-white/5 transition-all active:scale-[0.98]"
                  >
                    Work with us
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 md:py-32 relative z-1">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative z-10">
              <Reveal delay={0} direction="left">
                <span className="text-primary font-bold tracking-widest text-xs uppercase mb-4 block">
                  What we do
                </span>
              </Reveal>
              <Reveal delay={100} direction="left">
                <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                  We turn IP into
                  <br />
                  card games.
                </h2>
              </Reveal>
              <Reveal delay={200} direction="left">
                <div className="w-12 h-1 bg-gradient-to-r from-primary to-transparent mb-10" />
                <p className="text-slate-300 text-lg leading-relaxed mb-6 font-light">
                  A card is the smallest unit of a story. It carries art, rules and ownership in one
                  object, and it is the format players already know how to collect and trade.
                </p>
                <p className="text-slate-400 text-base leading-relaxed font-light">
                  We build the game, the card economy and the on-chain layer underneath it. Aurayale is
                  our own title and the proof of what the studio can ship.
                </p>
              </Reveal>
            </div>
            <Reveal direction="right" delay={200}>
              <div className="relative">
                <div className="aspect-square rounded-[24px] overflow-hidden glass-panel p-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-10" />
                  <img
                    alt="Aurayale gem cards"
                    className="w-full h-full object-cover rounded-[16px] opacity-60 transition-all duration-1000"
                    src="/images/card_layer.jpeg"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Bring us your IP：以卡牌形式呈現三種合作方式，稀有度色階作為視覺分層 */}
      <section className="py-24 md:py-32 bg-white/[0.01] relative z-1">
        <div className="max-w-[1400px] mx-auto px-6">
          <Reveal>
            <div className="max-w-2xl mb-16">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Bring us your IP.
              </h2>
              <p className="text-slate-400 font-light text-base leading-relaxed">
                Three ways studios, brands and project teams work with us.
              </p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                tier: "tcg-card--rare",
                rarity: "Card design",
                title: "Turn your IP into a deck",
                desc: "Character design, card framing, rarity tiers and the rules that make a set worth collecting.",
                art: "/images/card_01.png",
              },
              {
                tier: "tcg-card--epic",
                rarity: "Game build",
                title: "Ship a playable title",
                desc: "Unity client, matchmaking and live-ops. Aurayale runs on the same stack we would build for you.",
                art: "/images/card_03.png",
              },
              {
                tier: "tcg-card--legendary",
                rarity: "On-chain layer",
                title: "Put assets on-chain",
                desc: "ERC-1155 cards, wallet onboarding and a trading loop players can actually use.",
                art: "/images/card_04.png",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 120} direction="up" className="h-full">
                <article className={`tcg-card ${item.tier} h-full`}>
                  <div className="aspect-[5/3] overflow-hidden bg-background-dark">
                    <img
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover object-top opacity-70"
                      src={item.art}
                    />
                  </div>
                  <div className="flex flex-col flex-grow p-7">
                    <span className="tcg-rarity-label mb-3">{item.rarity}</span>
                    <h3 className="text-xl font-bold text-white mb-3 font-display">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed font-light">{item.desc}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Active Ventures / Our Products */}
      <section className="py-24 md:py-32 relative z-1">
        <div className="max-w-[1400px] mx-auto px-6">
          <Reveal>
            <div className="max-w-2xl mb-16">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Our own titles
              </h2>
              <p className="text-slate-400 font-light text-base leading-relaxed">
                What we build for ourselves, and what we can build with you.
              </p>
            </div>
          </Reveal>
          {/* 非對稱：Aurayale 為旗艦作品佔 3/5，DEAL 佔 2/5，避免兩張等大卡片的樣板感 */}
          <div className="grid lg:grid-cols-5 gap-6 md:gap-8">
            {/* Aurayale Card */}
            <Reveal delay={0} direction="up" className="lg:col-span-3">
              <div className="group relative rounded-[24px] overflow-hidden glass-panel h-full">
                <div className="aspect-[4/3] lg:aspect-[16/10] overflow-hidden">
                  <img
                    alt="Aurayale conceptual environment"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-50"
                    src="/images/index_aurayale.jpg"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                  <span className="tcg-rarity-label mb-3">Trading card game</span>
                  <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">Aurayale</h3>
                  <p className="text-slate-300 text-sm md:text-base mb-6 font-light max-w-md leading-relaxed">
                    Collect, upgrade and fuse gem cards across the Gem Universe.
                  </p>
                  <Link
                    href="/aurayale"
                    className="w-fit px-7 py-3 bg-primary text-background-dark font-bold text-sm rounded-[12px] hover:bg-secondary transition-colors active:scale-[0.98]"
                  >
                    Play Aurayale
                  </Link>
                </div>
              </div>
            </Reveal>
            {/* DEAL Card */}
            <Reveal delay={150} direction="up" className="lg:col-span-2">
              <div className="group relative rounded-[24px] overflow-hidden glass-panel h-full">
                <div className="aspect-[4/3] lg:aspect-[4/5] overflow-hidden">
                  <img
                    alt="DEAL conceptual environment"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-50"
                    src="/images/index_deal.jpg"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                  <span className="tcg-rarity-label mb-3">Toolkit</span>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">DEAL</h3>
                  <p className="text-slate-300 text-sm mb-6 font-light max-w-md leading-relaxed">
                    Take a tabletop game and make it playable online.
                  </p>
                  <a
                    href="https://chile109.github.io/DEAL-DOC/"
                    className="w-fit px-7 py-3 border border-white/20 text-white font-bold text-sm rounded-[12px] hover:bg-white/5 transition-colors active:scale-[0.98]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read the docs
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Our Team — 暫時隱藏 */}
      {/* <section className="py-24 md:py-32 relative z-1">
        <div className="max-w-[1400px] mx-auto px-6">
          <Reveal>
            <div className="text-center mb-20">
              <h2 className="font-display text-4xl font-bold text-white mb-4 tracking-tight">Our Team</h2>
              <p className="text-slate-400 font-light">The people who make the cards.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
            {teamMembers.map((member, i) => (
              <Reveal key={member.name} delay={i * 100} direction="up">
                <div className="group text-center">
                  <div className="aspect-square rounded-[16px] overflow-hidden mb-4 glass-panel relative">
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
              </Reveal>
            ))}
          </div>
        </div>
      </section> */}

      {/* Partners */}
      <section className="py-24 border-t border-white/5 bg-white/[0.01] overflow-hidden relative z-1">
        <Reveal>
          <div className="max-w-[1400px] mx-auto px-6">
            <h3 className="text-center text-sm font-medium text-slate-500 mb-16">
              Our partners
            </h3>
          </div>
        </Reveal>
        <style jsx>{`
          @keyframes marquee-scroll {
            0% {
              transform: translate3d(0, 0, 0);
            }
            100% {
              transform: translate3d(calc(-100% / 3), 0, 0);
            }
          }
          .marquee-container {
            position: relative;
            overflow: hidden;
          }
          .marquee-container::before,
          .marquee-container::after {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            width: 120px;
            z-index: 2;
            pointer-events: none;
          }
          .marquee-container::before {
            left: 0;
            background: linear-gradient(to right, var(--color-background-dark) 0%, transparent 100%);
          }
          .marquee-container::after {
            right: 0;
            background: linear-gradient(to left, var(--color-background-dark) 0%, transparent 100%);
          }
          .marquee-track {
            display: flex;
            align-items: center;
            gap: 80px;
            width: max-content;
            will-change: transform;
            animation: marquee-scroll 40s linear infinite;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
          .marquee-logo {
            display: block;
            height: 120px;
            width: auto;
            flex-shrink: 0;
            opacity: 0.3;
            filter: grayscale(100%) brightness(1.6);
            transform: translateZ(0);
            will-change: filter, opacity;
            transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                        filter 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
          }
          .marquee-logo:hover {
            opacity: 1;
            filter: grayscale(0%) brightness(1);
          }
        `}</style>
        <div className="marquee-container">
          <div className="marquee-track">
            {[...partners, ...partners, ...partners].map((p, i) => (
              <img
                key={`partner-${i}`}
                src={p.src}
                alt={p.alt}
                className="marquee-logo"
                draggable={false}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA：整幅色帶，不再用浮動面板，讓左右邊界對齊全站容器 */}
      <section className="relative overflow-hidden border-t border-white/5 bg-gradient-to-b from-secondary/10 to-transparent">
        <div className="max-w-[1400px] mx-auto px-6 py-24 md:py-32">
          <Reveal>
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-5 tracking-tight">
                  Got an IP?
                  <br />
                  Let&apos;s build the deck.
                </h2>
                <p className="text-slate-400 text-lg max-w-xl font-light leading-relaxed">
                  Tell us what you have and what you want players to do with it.
                </p>
              </div>
              <div className="lg:col-span-5 lg:justify-self-end">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-background-dark px-10 py-4 rounded-[12px] font-bold hover:bg-secondary transition-all active:scale-[0.98]"
                >
                  Work with us
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </LandingLayout>
  );
}
