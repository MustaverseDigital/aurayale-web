import type { CSSProperties, ReactNode } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

/**
 * 行銷頁的版面基礎元件。
 *
 * 三件事在這裡統一，其他地方就不該再自己寫一套：
 * 1. 捲動進場（Reveal）一律走 IntersectionObserver，不掛 scroll listener。
 * 2. 區塊上緣的髮絲線與定位十字（Rule）只有一種畫法，兩端十字剛好落在
 *    LandingLayout 的頁面 rail 上。
 * 3. 區塊的垂直節奏（Section）由這裡決定，各頁不要各自調 padding，
 *    不然 rule 與 rail 的交點會對不齊。
 */

type RevealDirection = "up" | "left" | "right" | "still";

const DIRECTION_CLASS: Record<RevealDirection, string> = {
  up: "",
  left: "mv-reveal--left",
  right: "mv-reveal--right",
  still: "mv-reveal--still",
};

/** 進場容器。delay 以毫秒傳入，透過 --mv-d 交給 CSS 錯開。 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  style?: CSSProperties;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`mv-reveal ${DIRECTION_CLASS[direction]} ${
        isVisible ? "is-in" : ""
      } ${className}`}
      style={{ ["--mv-d" as string]: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/**
 * 區塊分隔線。外層負責十字定位，內層那條線才是進場時展開的部分
 * （直接對 .mv-rule 做 scaleX 會把十字一起壓扁）。
 */
export function Rule({ className = "" }: { className?: string }) {
  return (
    <div className={`mv-rule ${className}`} aria-hidden="true">
      <span className="mv-rule__line" />
    </div>
  );
}

/**
 * 標準區塊：上緣一條 rule，rule 下方可放一個等寬小標籤當段落標記
 * （參考圖裡 SCENARIO / BACKGROUND 那種，貼在線上而不是壓在大標上面），
 * 再往下才是內容。
 */
export function Section({
  id,
  marker,
  tint = false,
  texture,
  className = "",
  contentClassName = "",
  children,
}: {
  id?: string;
  /** 段落標記，等寬大寫。不傳就只畫線。 */
  marker?: string;
  /** 交替底色，用來區隔相鄰區塊。 */
  tint?: boolean;
  /** 幾何材質。留白多的區塊給它一層，影像多的區塊留白即可。 */
  texture?: "hatch" | "dots";
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`relative z-10 scroll-mt-24 ${tint ? "bg-ink-2" : ""} ${
        texture ? `mv-texture mv-texture--${texture}` : ""
      } ${className}`}
    >
      <div className="mv-container">
        <Reveal direction="still" className="pt-16 md:pt-24">
          <Rule />
          {marker ? (
            <p className="mv-label mv-inset pt-3.5">{marker}</p>
          ) : null}
        </Reveal>
        <div className={`mv-inset pb-20 md:pb-28 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </section>
  );
}
