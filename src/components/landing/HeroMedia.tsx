import { useEffect, useRef, useState } from "react";
import {
  applyChroma,
  applySweep,
  buildHues,
  buildRingWeights,
  computeGrid,
  drawCover,
  sameGrid,
  seedFrom,
  VIGNETTE,
  type Grid,
} from "./mosaic";

/**
 * Hero 的影片主視覺。
 *
 * 四層疊在一起：
 * 1. 影片本體：灰階 + 提對比（.mv-media 處理）
 * 2. 馬賽克格：把影片畫到一張「一個像素等於一格」的小 canvas，再用
 *    image-rendering: pixelated 放大回來，並加上每格獨立的色相偏差
 * 3. 網點 + 掃描線
 * 4. 由下往上的壓暗漸層，讓文字壓在畫面下緣仍可讀
 *
 * 馬賽克刻意只更新 MOSAIC_FPS，格子會跟著畫面「一階一階跳」。跳動來自影片
 * 本身的內容變化，不是隨機閃爍。
 */

/** 刻意壓低：太高會變回流暢的影片，太低會變成一格一格的頓挫 */
const MOSAIC_FPS = 10;
/**
 * 每一幀用這個透明度疊在前一幀上，而不是整張換掉。
 * 格子會「滑」向新的值而不是硬跳，畫面動得大的時候也不會變成頻閃。
 * 調高會更接近原始影片、也更容易閃；調低會拖出殘影。
 */
const MOSAIC_BLEND = 0.32;
/**
 * 色偏強度（0-255 的偏移量）。因為現在只作用在淡出交界那一圈上，
 * 可以下得比整面套用時重一些。
 */
const CHROMA_STRENGTH = 40;
/** 馬賽克保留多少來源色彩：0 全灰、1 原色。與影片的 grayscale(0.7) 對齊。 */
const MOSAIC_SATURATION = 0.3;
/** 色相非常慢地繞圈，整輪約 80 秒。快到看得出來就會變成七彩跑馬燈。 */
const CHROMA_DRIFT = 0.00008;
/** 掃描帶跑完一輪的時間。太快會像跑馬燈，太慢就看不出在動。 */
const SWEEP_PERIOD_MS = 7200;

export function HeroMedia({ src, poster }: { src: string; poster: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<Grid>({ cols: 48, rows: 27 });

  // 只在 resize 時更新 state，不會每一幀都動到 React
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const measure = () => {
      const { width, height } = wrap.getBoundingClientRect();
      if (!width || !height) return;
      const next = computeGrid(width, height);
      setGrid((prev) => (sameGrid(prev, next) ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !video || !canvas) return;

    canvas.width = grid.cols;
    canvas.height = grid.rows;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 疊幀要疊在「還沒上色」的畫面上，否則色偏會一幀一幀累加。
    // 所以另外開一張離屏 canvas 當累積用，上色只在輸出到畫面時做。
    const accumulator = document.createElement("canvas");
    accumulator.width = grid.cols;
    accumulator.height = grid.rows;
    const accCtx = accumulator.getContext("2d", { willReadFrequently: true });
    if (!accCtx) return;

    const hues = buildHues(grid.cols, grid.rows, seedFrom(src));
    // 色偏只作用在畫面淡出的那一圈上（上緣另外關掉），中央與最外緣都是 0
    const ring = buildRingWeights(grid.cols, grid.rows);
    // 掃描帶每幀重算，寫進這張固定的陣列裡，不每幀配置新記憶體
    const weights = new Float32Array(ring.length);
    // 第一幀要整張畫滿，之後才開始疊；否則會從全黑淡進來
    let primed = false;

    /** 畫一幀。回傳 false 代表影片還沒準備好。 */
    const paint = (now: number) => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh || video.readyState < 2) return false;
      const box = wrap.getBoundingClientRect();
      if (!box.width || !box.height) return false;

      drawCover(accCtx, video, vw, vh, box.width, box.height, grid, primed ? MOSAIC_BLEND : 1);
      primed = true;

      // 掃描帶：像 Blender 一格一格算圖那樣掃過去，帶到之處色偏最強
      applySweep(weights, ring, grid.cols, grid.rows, (now / SWEEP_PERIOD_MS) % 1);

      const frame = accCtx.getImageData(0, 0, grid.cols, grid.rows);
      applyChroma(frame.data, hues, CHROMA_STRENGTH, {
        saturation: MOSAIC_SATURATION,
        drift: now * CHROMA_DRIFT,
        weights,
      });
      ctx.putImageData(frame, 0, 0);
      return true;
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 關閉動態時只畫一張靜態的馬賽克，不跑迴圈
    if (reduceMotion) {
      let cancelled = false;
      let timer = 0;
      const once = () => {
        if (cancelled) return;
        if (!paint(0)) timer = window.setTimeout(once, 200);
      };
      once();
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }

    let frameId = 0;
    let last = 0;
    let inView = true;

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      // 捲出畫面或切到別的分頁就不畫，別在背景燒電
      if (!inView || document.hidden) return;
      if (now - last < 1000 / MOSAIC_FPS) return;
      last = now;
      paint(now);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(wrap);
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [grid, src]);

  return (
    <div
      ref={wrapRef}
      className="mv-media mv-media--dot mv-media--scan mv-media--vignette mv-media--tint absolute inset-0 z-0"
      style={{
        // 遮罩的橢圓與 buildRingWeights 用的是同一組數字（見 mosaic.ts 的 VIGNETTE），
        // 從這裡交給 CSS，避免兩邊各寫一份而慢慢對不上
        ["--mv-vig-cx" as string]: `${VIGNETTE.cx * 100}%`,
        ["--mv-vig-cy" as string]: `${VIGNETTE.cy * 100}%`,
        ["--mv-vig-rx" as string]: `${VIGNETTE.rx * 100}%`,
        ["--mv-vig-ry" as string]: `${VIGNETTE.ry * 100}%`,
        ["--mv-vig-solid" as string]: `${VIGNETTE.solid * 100}%`,
      }}
    >
      <video
        ref={videoRef}
        className="mv-hero-media"
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* 外層吃捲動視差，內層才是馬賽克 —— 兩個動態各自佔一個 transform／animation，
          擠在同一個元素上會互相蓋掉。 */}
      <div className="mv-hero-media absolute inset-0 z-[2]" aria-hidden="true">
        <div
          className="mv-mosaic"
          style={{
            ["--mv-mosaic-cols" as string]: String(grid.cols),
            ["--mv-mosaic-rows" as string]: String(grid.rows),
          }}
        >
          <canvas ref={canvasRef} className="mv-mosaic__canvas" />
        </div>
      </div>

      {/* 由下往上壓暗，讓文字壓在畫面下緣仍可讀（漸層定義在 .mv-hero-scrim） */}
      <div className="mv-hero-scrim absolute inset-0 z-[4]" />
    </div>
  );
}
