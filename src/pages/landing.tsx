import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { LandingLayout } from "../components/landing/LandingLayout";
import { HeroMedia } from "../components/landing/HeroMedia";
import { MosaicImage } from "../components/landing/MosaicImage";
import { Reveal, Rule, Section } from "../components/landing/primitives";

const PARTNERS = [
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
//   ...
// ];

export default function LandingPage() {
  const { t } = useTranslation();

  /**
   * 三種委託層次。每一列的欄位起訖刻意不同，讓同一個 layout family
   * 內部仍有節奏，不會變成三列一模一樣的樣板。
   */
  /**
   * 三個委託層次。影像不是貼在文字旁邊的方框，而是鋪滿整列、往文字那一側
   * 羽化掉，文字直接壓在同一個平面上。三列的影像寬度與貼邊方向刻意不同，
   * 同一個 layout family 內部才有節奏。
   */
  const services = [
    {
      label: t("site.services.tcg.label"),
      title: t("site.services.tcg.title"),
      desc: t("site.services.tcg.desc"),
      art: "/images/service_tcg.jpg",
      side: "right" as const,
      artWidth: "w-[86%] md:w-[64%]",
      textClass: "md:col-start-3 md:col-span-6",
    },
    {
      label: t("site.services.rwa.label"),
      title: t("site.services.rwa.title"),
      desc: t("site.services.rwa.desc"),
      art: "/images/service_rwa.jpg",
      side: "left" as const,
      artWidth: "w-[86%] md:w-[58%]",
      textClass: "md:col-start-7 md:col-span-6",
    },
    {
      label: t("site.services.xr.label"),
      title: t("site.services.xr.title"),
      desc: t("site.services.xr.desc"),
      art: "/images/service_xr.jpg",
      side: "right" as const,
      artWidth: "w-[86%] md:w-[70%]",
      textClass: "md:col-start-2 md:col-span-6",
    },
  ];

  return (
    <LandingLayout activePage="home">
      {/* ── Hero ──
          影片本身就是主視覺：灰階 + 馬賽克格 + 網點 + 掃描線（見 HeroMedia）。
          文字壓在畫面下緣靠左，右半留給影像。捲動時的下沉由 CSS
          scroll-driven animation 處理（.mv-hero-media），不掛 scroll listener。 */}
      <section className="relative z-10 flex min-h-[calc(100dvh-var(--mv-nav-h))] items-end overflow-hidden pt-24 pb-24 md:pb-28 lg:pb-36">
        <HeroMedia src="/images/home_banner.mp4" poster="/images/home_hero.jpg" />

        <div className="mv-container relative z-10">
          <div className="mv-inset grid grid-cols-1 gap-y-6 md:grid-cols-12">
            <div className="md:col-span-11 lg:col-span-9">
              <p className="mv-label mv-enter mb-7" style={{ ["--mv-d" as string]: "80ms" }}>
                {t("site.hero.eyebrow")}
              </p>
              <h1 className="mv-display mv-enter mb-7" style={{ ["--mv-d" as string]: "180ms" }}>
                {t("site.hero.titleLine1")}
                <br />
                {t("site.hero.titleLine2")}
              </h1>
              <p
                className="mv-lead mv-enter mb-10 max-w-[34rem]"
                style={{ ["--mv-d" as string]: "300ms" }}
              >
                {t("site.hero.body")}
              </p>
              <div
                className="mv-enter flex flex-col gap-3 sm:flex-row"
                style={{ ["--mv-d" as string]: "420ms" }}
              >
                <Link href="/contact" className="mv-btn mv-btn--accent">
                  {t("site.hero.ctaPrimary")}
                  <ArrowRight className="mv-btn__arrow h-4 w-4" strokeWidth={2} />
                </Link>
                <Link href="/aurayale" className="mv-btn mv-btn--ghost">
                  {t("site.hero.ctaSecondary")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 合作夥伴 ──
          logo 牆貼在 hero 正下方。全站唯一一條跑馬燈，維持灰階，
          hover 只提亮不還原彩色。 */}
      <Section texture="dots">
        <Reveal direction="still" className="pt-12 md:pt-16">
          <p className="mv-label mb-10 text-center">{t("site.partners")}</p>
          <div className="mv-marquee">
            <div className="mv-marquee__track">
              {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((p, i) => (
                <img
                  key={`partner-${i}`}
                  src={p.src}
                  alt={p.alt}
                  className="mv-marquee__logo"
                  draggable={false}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ── 我們做什麼 ──
          純文字的宣言式版面：大標獨占上半，兩段內文收在右下角，
          中間用一條線切開。整頁只有這一個區塊沒有影像。 */}
      <Section marker={t("site.philosophy.eyebrow")} texture="hatch">
        <Reveal className="pt-12 md:pt-16">
          <h2 className="mv-h1 max-w-[18ch]">
            {t("site.philosophy.titleLine1")}
            <br />
            {t("site.philosophy.titleLine2")}
          </h2>
        </Reveal>
        <Reveal className="pt-14 md:pt-20" delay={120}>
          <Rule className="mv-rule--full" />
          <div className="grid grid-cols-1 gap-10 pt-10 md:grid-cols-12 md:gap-8">
            <p className="mv-body md:col-start-4 md:col-span-4">
              {t("site.philosophy.body1")}
            </p>
            <p className="mv-body md:col-start-9 md:col-span-4">
              {t("site.philosophy.body2")}
            </p>
          </div>
        </Reveal>
      </Section>

      {/* ── 把你的 IP 交給我們 ──
          三個委託層次做成索引列：分類標籤在左側欄，標題與說明在中間，
          卡面圖在另一側，列與列之間只有一條線。 */}
      <Section tint>
        <Reveal className="pt-12 md:pt-16">
          <h2 className="mv-h2 max-w-[20ch]">{t("site.services.title")}</h2>
          <p className="mv-lead mt-5">{t("site.services.subtitle")}</p>
        </Reveal>
        <div className="mt-12 md:mt-16">
          {services.map((item, i) => (
            <Reveal key={item.label} delay={i * 90}>
              <article className="mv-row relative overflow-hidden">
                {/* 手機是流內元素（影像在上、文字在下，靠負 margin 疊一點）；
                    md 以上才改成絕對定位鋪滿整列，文字直接壓在影像上。 */}
                <MosaicImage
                  src={item.art}
                  alt={`${item.title} 示意`}
                  className={`mv-media--hover mv-media--feather ${
                    item.side === "right"
                      ? "mv-media--feather-l md:right-0"
                      : "mv-media--feather-r md:left-0"
                  } ${item.artWidth} relative z-0 h-56 w-full md:absolute md:inset-y-0 md:h-auto`}
                  hover
                />
                <div className="relative z-10 -mt-10 grid grid-cols-1 items-center gap-5 pb-14 md:mt-0 md:min-h-[24rem] md:grid-cols-12 md:gap-8 md:py-20">
                  <p className="mv-label md:col-start-1 md:col-span-2">{item.label}</p>
                  <div className={item.textClass}>
                    <h3 className="mv-h3 mv-row__title">{item.title}</h3>
                    <p className="mv-body mv-body--sm mt-3 max-w-[34ch]">{item.desc}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── 自研作品 ──
          破格排版：Aurayale 佔七欄，DEAL 佔四欄並整體往下沉，
          文字放在圖片下方（不疊在圖上）。 */}
      <Section texture="dots">
        <Reveal className="pt-12 md:pt-16">
          <h2 className="mv-h2 max-w-[16ch]">{t("site.titles.heading")}</h2>
          <p className="mv-lead mt-5">{t("site.titles.subtitle")}</p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-14 md:mt-20 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-7">
            <Link href="/aurayale" className="group block">
              {/* 自研作品是產品圖，維持原本彩色，只疊馬賽克質感 */}
              <MosaicImage
                src="/images/index_aurayale.jpg"
                alt="Aurayale 的寶石宇宙場景"
                className="aspect-[16/10]"
                color
                hover
              />
              <div className="flex items-start justify-between gap-6 pt-6">
                <div>
                  {/* 分類標籤與標題同一條基線，不疊在標題上方（避免每張卡都長出一個
                      小標籤的樣板節奏） */}
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <h3 className="mv-h3">Aurayale</h3>
                    <p className="mv-label">{t("site.titles.aurayaleLabel")}</p>
                  </div>
                  <p className="mv-body mv-body--sm mt-4 max-w-[42ch]">
                    {t("site.titles.aurayaleDesc")}
                  </p>
                </div>
                <ArrowUpRight
                  className="mt-1 h-6 w-6 shrink-0 text-fg-3 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-fg-1"
                  strokeWidth={1.5}
                />
              </div>
              <span className="mv-link mt-6 inline-block text-caption font-semibold text-fg-1">
                {t("site.titles.aurayaleCta")}
              </span>
            </Link>
          </Reveal>

          <Reveal className="md:col-start-9 md:col-span-4 md:mt-24" delay={140}>
            <a
              href="https://chile109.github.io/DEAL-DOC/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <MosaicImage
                src="/images/index_deal.jpg"
                alt="DEAL 線上桌遊工具組畫面"
                className="aspect-[4/3]"
                color
                hover
              />
              <div className="flex items-start justify-between gap-6 pt-6">
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <h3 className="mv-h3">DEAL</h3>
                    <p className="mv-label">{t("site.titles.dealLabel")}</p>
                  </div>
                  <p className="mv-body mv-body--sm mt-4">{t("site.titles.dealDesc")}</p>
                </div>
                <ArrowUpRight
                  className="mt-1 h-5 w-5 shrink-0 text-fg-3 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-fg-1"
                  strokeWidth={1.5}
                />
              </div>
              <span className="mv-link mt-6 inline-block text-caption font-semibold text-fg-1">
                {t("site.titles.dealCta")}
              </span>
            </a>
          </Reveal>
        </div>
      </Section>

      {/* ── 收尾 CTA ──
          整幅色帶，大標靠左，按鈕獨立成一欄靠右對齊大標底線。 */}
      <Section tint texture="hatch" contentClassName="pb-20 md:pb-32">
        <Reveal className="pt-12 md:pt-16">
          <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <h2 className="mv-h1 max-w-[20ch]">
                {t("site.cta.titleLine1")}
                <br />
                {t("site.cta.titleLine2")}
              </h2>
              <p className="mv-lead mt-6">{t("site.cta.body")}</p>
            </div>
            <div className="md:col-start-10 md:col-span-3 md:justify-self-end">
              <Link href="/contact" className="mv-btn mv-btn--accent w-full sm:w-auto">
                {t("site.cta.button")}
                <ArrowRight className="mv-btn__arrow h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>
    </LandingLayout>
  );
}
