import { useEffect, useRef, useState } from "react";
import { buildHues, drawCover, seedFrom, VIGNETTE, type Grid } from "./mosaic";
import { buildGridLayout, renderGridOverlay } from "./gridOverlay";
import {
  applySweep,
  buildRingWeights,
  canvasSizeFor,
  gridFor,
  paintTint,
  renderDither,
  renderMarks,
  type HalftonePattern,
} from "./halftone";

/**
 * Hero 的影片主視覺。
 *
 * 疊起來的層序：
 * 1. 影片本體：灰階（保留一點原色）+ 橢圓暈影
 * 2. 網版 canvas：影片降採樣後依每格亮度畫標記（圓點／十字／抖動）
 * 3. 掃描線
 * 4. 由下往上的壓暗漸層，讓文字壓在畫面下緣仍可讀
 *
 * 網版刻意只更新 SCREEN_FPS：標記會一階一階跳，而不是連續流動。
 * 動態有三個來源疊在一起 —— 影片內容本身、掃描帶讓標記脹縮、
 * 色相非常慢地繞圈；圖樣本身還會隨掃描帶爬動（dither 最明顯）。
 */

/** 預設圖樣。也可以在網址加 ?screen=dot|cross|dither 當場切換來比較。 */
const PATTERN: HalftonePattern = "dither";
const PATTERNS: HalftonePattern[] = ["dot", "cross", "dither"];

/** 刻意壓低：太高會變回流暢的影片，太低會變成一格一格的頓挫 */
const SCREEN_FPS = 12;
/** 色偏強度。只作用在淡出交界那一圈上，可以下得比整面套用時重一些。 */
const CHROMA_STRENGTH = 46;
/** 色相非常慢地繞圈，整輪約 80 秒。快到看得出來就會變成七彩跑馬燈。 */
const CHROMA_DRIFT = 0.00008;
/** 掃描帶跑完一輪的時間。太快會像跑馬燈，太慢就看不出在動。 */
const SWEEP_PERIOD_MS = 7200;

export function HeroMedia({ src, poster }: { src: string; poster: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLCanvasElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [pattern, setPattern] = useState<HalftonePattern>(PATTERN);

  // 在 effect 裡才讀網址，server 與 client 的首次輸出才會一致
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("screen");
    if (q && (PATTERNS as string[]).includes(q)) setPattern(q as HalftonePattern);
  }, []);

  // 只在 resize 時更新 state，不會每一幀都動到 React
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const measure = () => {
      const { width, height } = wrap.getBoundingClientRect();
      if (!width || !height) return;
      setBox((prev) =>
        Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1
          ? prev
          : { width, height }
      );
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
    if (!wrap || !video || !canvas || !box.width || !box.height) return;

    const grid: Grid = gridFor(pattern, box.width, box.height);
    const size = canvasSizeFor(pattern, grid, box.width, box.height);
    canvas.width = size.width;
    canvas.height = size.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 降採樣用的離屏 canvas：一個像素等於一格，之後只讀這張的亮度
    const sampler = document.createElement("canvas");
    sampler.width = grid.cols;
    sampler.height = grid.rows;
    const sampleCtx = sampler.getContext("2d", { willReadFrequently: true });
    if (!sampleCtx) return;

    // 標記顏色用的小圖，最後用 source-atop 一次疊上所有標記
    const tint = document.createElement("canvas");
    tint.width = grid.cols;
    tint.height = grid.rows;
    const tintCtx = tint.getContext("2d");
    if (!tintCtx) return;
    const tintImage = tintCtx.createImageData(grid.cols, grid.rows);

    const hues = buildHues(grid.cols, grid.rows, seedFrom(src));
    // 色偏只落在畫面淡出的那一圈上（上緣另外關掉）
    const ring = buildRingWeights(grid.cols, grid.rows);
    const sweep = new Float32Array(ring.length);
    // 標記脹縮用的是滿版掃描帶，不受色偏那一圈限制
    const full = new Float32Array(ring.length).fill(1);
    const sizeSweep = new Float32Array(ring.length);

    const cellW = size.width / grid.cols;
    const cellH = size.height / grid.rows;

    // 大格線層：獨立一張實際尺寸的 canvas，才不會被 dither 的 pixelated 放大糊掉
    const overlay = gridRef.current;
    const overlayCtx = overlay ? overlay.getContext("2d") : null;
    const overlayW = Math.round(box.width);
    const overlayH = Math.round(box.height);
    let layout: ReturnType<typeof buildGridLayout> | null = null;
    if (overlay && overlayCtx) {
      overlay.width = overlayW;
      overlay.height = overlayH;
      layout = buildGridLayout(overlayW, overlayH, seedFrom(src));
    }

    const paint = (now: number) => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh || video.readyState < 2) return false;

      drawCover(sampleCtx, video, vw, vh, box.width, box.height, grid);
      const sample = sampleCtx.getImageData(0, 0, grid.cols, grid.rows);

      const phase = (now / SWEEP_PERIOD_MS) % 1;
      const drift = now * CHROMA_DRIFT;
      applySweep(sweep, ring, grid.cols, grid.rows, phase);

      if (overlayCtx && layout) {
        renderGridOverlay(overlayCtx, layout, overlayW, overlayH, now);
      }

      if (pattern === "dither") {
        renderDither(sample.data, grid, hues, sweep, CHROMA_STRENGTH, drift, phase);
        ctx.putImageData(sample, 0, 0);
        return true;
      }

      applySweep(sizeSweep, full, grid.cols, grid.rows, phase);
      ctx.clearRect(0, 0, size.width, size.height);
      ctx.fillStyle = "#fff";
      renderMarks(ctx, sample.data, grid, pattern, cellW, cellH, sizeSweep);

      // 一次把色偏套到所有標記上，不必逐格換 fillStyle
      paintTint(tintImage.data, sample.data, hues, sweep, CHROMA_STRENGTH, drift);
      tintCtx.putImageData(tintImage, 0, 0);
      ctx.globalCompositeOperation = "source-atop";
      ctx.drawImage(tint, 0, 0, size.width, size.height);
      ctx.globalCompositeOperation = "source-over";
      return true;
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 關閉動態時只畫一張靜態的，不跑迴圈
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
      if (now - last < 1000 / SCREEN_FPS) return;
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
  }, [box, src, pattern]);

  return (
    <div
      ref={wrapRef}
      className="mv-media mv-media--scan mv-media--vignette mv-media--tint absolute inset-0 z-0"
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

      {/* 外層吃捲動視差，內層才是網版 —— 兩個動態各自佔一個 transform／animation，
          擠在同一個元素上會互相蓋掉。 */}
      <div className="mv-hero-media absolute inset-0 z-[2]" aria-hidden="true">
        {/* dither 的 canvas 本身已經含有原影像（見 DITHER_DEPTH），
            它是主影像而不是疊在影片上的標記，所以用 normal 混合。 */}
        <div className={pattern === "dither" ? "mv-screen mv-screen--flat" : "mv-screen"}>
          <canvas
            ref={canvasRef}
            className={
              pattern === "dither" ? "mv-screen__canvas is-pixelated" : "mv-screen__canvas"
            }
          />
        </div>
        {/* 大格線疊在網版之上：不吃暈影遮罩，可見度已經在 canvas 裡逐段算過 */}
        <canvas ref={gridRef} className="mv-grid-overlay" />
      </div>

      {/* 由下往上壓暗，讓文字壓在畫面下緣仍可讀（漸層定義在 .mv-hero-scrim） */}
      <div className="mv-hero-scrim absolute inset-0 z-[4]" />
    </div>
  );
}
