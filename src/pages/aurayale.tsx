import { useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { LandingLayout } from "../components/landing/LandingLayout";
import { HeroMedia } from "../components/landing/HeroMedia";
import { MosaicImage } from "../components/landing/MosaicImage";
import { Reveal, Rule, Section } from "../components/landing/primitives";
import { useLogin } from "../hooks/useLogin";

const TRAILER_URL = "https://youtu.be/UFAOxXTXFuo";

/**
 * Gem Cuts 的卡牌扇形。旋轉與垂直位移寫死成常數，靠負的水平外距互相疊壓，
 * 不再用 vw 算位移（視窗一窄就會爆版）。
 */
const FAN_CARDS = [
  { src: "/images/card_01.png", rotate: -13, offsetY: 26, z: 1 },
  { src: "/images/card_02.png", rotate: -4.5, offsetY: 5, z: 2 },
  { src: "/images/card_03.png", rotate: 4.5, offsetY: 5, z: 3 },
  { src: "/images/card_04.png", rotate: 13, offsetY: 26, z: 4 },
];

const AWARDS = [
  { name: "ETHGlobal", sub: "Finalist 2024" },
  { name: "BYBIT", nameSuffix: "Unleashed", sub: "Grant Recipient" },
  { name: "Avalanche", sub: "AVAX Ecosystem" },
];

export default function AurayalePage() {
  const { t } = useTranslation();
  const router = useRouter();
  // autoProcess 讓 Privy 登入完成後接著跑 processLogin（換取 Aura token、
  // 抓寶石與牌組）。
  //
  // 目前刻意「不」自動跳轉：useLogin 的 redirectTo 預設為 null。
  // 本頁同時掛載了 LandingNavbar 與 MobileMenu，三個 useLogin 實例會各自
  // 跳一次，跳轉行為互相打架。要恢復自動跳轉時，只在「一個」實例傳 redirectTo。
  const { login, authenticated, ready } = useLogin({ autoProcess: true });

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

  // 登入後的導向交給 useLogin（等 processLogin 完成才跳）。
  // 這裡只處理「已經登入、再點一次按鈕」的情況。
  const handleStartAdventure = () => {
    if (ready && authenticated) {
      router.push("/battle");
    } else {
      login();
    }
  };

  return (
    <LandingLayout activePage="aurayale">
      {/* ── Hero ──
          影片只放在 hero 內，不再整頁 fixed：8MB 的 banner.mp4 掛在整個
          捲動流程上，手機會一路解碼到底。poster 讓首屏立刻有畫面。 */}
      <section className="relative z-10 flex min-h-[calc(100dvh-var(--mv-nav-h))] items-end overflow-hidden pt-24 pb-24 md:pb-28 lg:pb-36">
        <HeroMedia src="/images/banner.mp4" poster="/images/aurayale_hero.jpg" />

        <div className="mv-container relative z-10">
          <div className="mv-inset max-w-[52rem]">
            <p className="mv-chip mv-enter mb-7" style={{ ["--mv-d" as string]: "80ms" }}>
              {t("site.aurayale.hero.badge")}
            </p>
            <h1 className="mv-display mv-enter mb-7" style={{ ["--mv-d" as string]: "180ms" }}>
              {t("site.aurayale.hero.titleLine1")}
              <br />
              {t("site.aurayale.hero.titleLine2")}
            </h1>
            <p
              className="mv-body mv-enter mb-10 max-w-[42ch]"
              style={{ ["--mv-d" as string]: "300ms" }}
            >
              {t("site.aurayale.hero.body")}
            </p>
            <div
              className="mv-enter flex flex-col gap-3 sm:flex-row"
              style={{ ["--mv-d" as string]: "420ms" }}
            >
              <button onClick={handleStartAdventure} className="mv-btn mv-btn--accent">
                {t("site.aurayale.hero.ctaPrimary")}
                <ArrowRight className="mv-btn__arrow h-4 w-4" strokeWidth={2} />
              </button>
              <a
                href={TRAILER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mv-btn mv-btn--ghost"
              >
                {t("site.aurayale.hero.ctaSecondary")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 遊戲介紹 ── */}
      <Section id="home" marker={t("site.aurayale.home.eyebrow")}>
        {/* 影像鋪滿整段、往文字那側羽化掉，文字直接壓在同一個平面上 */}
        <div className="relative overflow-hidden pt-12 md:pt-16">
          <MosaicImage
            src="/images/aurayale_home.jpg"
            alt="Aurayale 寶石宇宙的星球場景"
            className="mv-media--feather mv-media--feather-r relative z-0 h-60 w-full md:absolute md:inset-y-0 md:left-0 md:h-auto md:w-[62%]"
            scan
          />
          <Reveal
            direction="right"
            className="relative z-10 -mt-10 grid grid-cols-1 items-center pb-16 md:mt-0 md:min-h-[26rem] md:grid-cols-12 md:py-24"
          >
            <div className="md:col-start-7 md:col-span-6">
              <h2 className="mv-h2">
                {t("site.aurayale.home.welcome")}
                <br />
                {t("site.aurayale.home.title")}
              </h2>
              <p className="mv-body mt-6">{t("site.aurayale.home.body")}</p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* HOT Games 區塊暫時隱藏（原本是 hidden 但仍會送到瀏覽器，
          且內含尚未成真的房間數據；先收成註解，要恢復再展開）。 */}

      {/* ── Gem Cuts ──
          卡牌扇形放在一條基準線上，像攤在桌面上的手牌。
          hover 會把該張抬起並讓灰階退開一點，用來表示卡牌本身可互動。 */}
      <Section id="gem-cuts" tint texture="dots">
        <Reveal className="pt-12 md:pt-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <h2 className="mv-h2 md:col-span-5">{t("site.aurayale.gemCuts.title")}</h2>
            <div className="md:col-start-8 md:col-span-5 md:self-end">
              <p className="mv-label">{t("site.aurayale.gemCuts.deckLine")}</p>
              <p className="mv-body mt-4">{t("site.aurayale.gemCuts.comboLine")}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120} className="mt-16 md:mt-24">
          <div className="flex items-end justify-center">
            {FAN_CARDS.map((card, i) => (
              <div
                key={card.src}
                className="mv-fan"
                style={{
                  zIndex: card.z,
                  ["--mv-fan-r" as string]: `${card.rotate}deg`,
                  ["--mv-fan-y" as string]: `${card.offsetY}px`,
                  marginInline: "-2.5%",
                }}
              >
                <div className="mv-fan__float" style={{ animationDelay: `${i * 0.65}s` }}>
                  <img
                    src={card.src}
                    alt={`Aurayale 寶石卡牌 ${String(i + 1).padStart(2, "0")}`}
                    className="mv-fan__img w-[22vw] min-w-[86px] max-w-[196px]"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
          <Rule className="mv-rule--full mt-10" />
        </Reveal>
      </Section>

      {/* ── SwUp System ──
          技術面板：直角、四角定位標記，兩項規格用一條線隔開。 */}
      <Section id="swup-system" texture="hatch">
        <Reveal className="pt-12 md:pt-20">
          <div className="mv-panel mv-marks relative overflow-hidden">
            {/* 影像貼齊面板的三個邊，往左羽化，看起來就是面板本身而不是嵌在裡面的圖 */}
            <MosaicImage
              src="/images/swup_system.jpg"
              alt="SwUp 交換與升級流程示意"
              className="mv-media--feather mv-media--feather-l relative z-0 h-60 w-full md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[58%]"
            />
            <div className="relative z-10 -mt-10 grid grid-cols-1 items-center px-8 pb-8 md:mt-0 md:min-h-[30rem] md:grid-cols-12 md:p-14">
              <div className="md:col-span-6">
                <p className="mv-chip mb-7">{t("site.aurayale.swup.badge")}</p>
                <h2 className="mv-h2">
                  {t("site.aurayale.swup.titleLine1")}
                  <br />
                  {t("site.aurayale.swup.titleLine2")}
                </h2>
                <p className="mv-body mt-6">{t("site.aurayale.swup.body")}</p>

                <ul className="mt-10">
                  {[
                    {
                      Icon: Check,
                      title: t("site.aurayale.swup.erc1155Title"),
                      desc: t("site.aurayale.swup.erc1155Desc"),
                    },
                    {
                      Icon: ShieldCheck,
                      title: t("site.aurayale.swup.vrfTitle"),
                      desc: t("site.aurayale.swup.vrfDesc"),
                    },
                  ].map(({ Icon, title, desc }) => (
                    <li key={title} className="mv-row flex items-start gap-4 py-5">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-fg-3" strokeWidth={1.5} />
                      <div>
                        <h3 className="mv-h3 text-[0.9375rem]">{title}</h3>
                        <p className="mv-body mv-body--sm mt-1.5">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ── 業界肯定 ──
          三個獎項用垂直髮絲線分隔，去掉原本的鑽石／火箭圖示（太樣板）。 */}
      <Section id="awards" marker={t("site.aurayale.awards.title")} tint>
        <Reveal className="pt-10 md:pt-14">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {AWARDS.map((award, i) => (
              <div
                key={award.name}
                className={`py-8 sm:py-4 ${
                  i > 0
                    ? "border-t border-line-1 sm:border-t-0 sm:border-l sm:pl-10"
                    : ""
                } ${i === 0 ? "sm:pr-10" : ""} ${i === 1 ? "sm:pr-10" : ""}`}
              >
                <p className="mv-h2 text-[clamp(1.5rem,2.4vw,2rem)]">
                  {award.name}
                  {award.nameSuffix ? (
                    <span className="font-light text-fg-2"> {award.nameSuffix}</span>
                  ) : null}
                </p>
                <p className="mv-label mt-3">{award.sub}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* ── 收尾 CTA ── */}
      <Section texture="hatch" contentClassName="pb-20 md:pb-32">
        <Reveal className="pt-14 md:pt-20">
          <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <h2 className="mv-h2 text-[clamp(2rem,4.4vw,3.5rem)]">
                {t("site.aurayale.cta.titleLine1")}
                <br />
                {t("site.aurayale.cta.titleLine2")}
              </h2>
              <p className="mv-body mt-6">{t("site.aurayale.cta.body")}</p>
            </div>
            <div className="md:col-start-10 md:col-span-3 md:justify-self-end">
              <button
                onClick={handleStartAdventure}
                className="mv-btn mv-btn--accent w-full sm:w-auto"
              >
                {t("site.aurayale.cta.button")}
                <ArrowRight className="mv-btn__arrow h-4 w-4" strokeWidth={2} />
              </button>
              <p className="mv-label mt-4 md:text-right">Browser &amp; VR Compatible</p>
            </div>
          </div>
        </Reveal>
      </Section>
    </LandingLayout>
  );
}
