import { useEffect, useRef, useState } from "react";
import { applySaturation, computeGrid, drawCover, sameGrid, type Grid } from "./mosaic";

/**
 * 內容圖用的馬賽克格。與 hero 同一套格線與色偏規則，差別只在這裡是靜態的：
 * 圖片載入完（以及 resize）才畫一次，不跑動畫迴圈 —— 整頁十來張圖如果都在動，
 * 會吵到看不下去，也沒必要燒那個電。
 *
 * <img> 照常輸出（LCP、alt、右鍵另存都要靠它），馬賽克只是疊在上面的一層。
 */

/**
 * 非彩色模式保留多少來源色。0 會把來源的雙色調洗成灰，等於白算了那組色票。
 *
 * 這裡刻意不做每格的隨機色偏（主視覺才有）—— 配圖是用來說明內容的，
 * 撒上來源沒有的綠紫斑點只會讓圖變髒。
 */
const TONE_SATURATION = 0.8;

export function MosaicImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  color = false,
  hover = false,
  scan = false,
  loading = "lazy",
}: {
  src: string;
  alt: string;
  /** 外層額外的 class，比例（aspect-[4/3]）之類的放這裡 */
  className?: string;
  imgClassName?: string;
  /** 維持原本的彩色，不轉灰階 */
  color?: boolean;
  /** hover 時推近並讓灰階退開，用來表示這張圖可點 */
  hover?: boolean;
  scan?: boolean;
  loading?: "lazy" | "eager";
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<Grid>({ cols: 24, rows: 18 });

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
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !img || !canvas) return;

    canvas.width = grid.cols;
    canvas.height = grid.rows;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const paint = () => {
      if (!img.complete || !img.naturalWidth) return false;
      const box = wrap.getBoundingClientRect();
      if (!box.width || !box.height) return false;
      drawCover(ctx, img, img.naturalWidth, img.naturalHeight, box.width, box.height, grid);
      const frame = ctx.getImageData(0, 0, grid.cols, grid.rows);
      applySaturation(frame.data, color ? 1 : TONE_SATURATION);
      ctx.putImageData(frame, 0, 0);
      return true;
    };

    if (paint()) return;

    // 圖還沒載完就等 load。decode 失敗也要收掉 listener，不然會留著。
    const onReady = () => paint();
    img.addEventListener("load", onReady);
    return () => img.removeEventListener("load", onReady);
  }, [grid, src, color]);

  return (
    <div
      ref={wrapRef}
      className={`mv-media mv-media--dot ${color ? "mv-media--color" : ""} ${
        hover ? "mv-media--hover" : ""
      } ${scan ? "mv-media--scan" : ""} ${className}`}
    >
      <img ref={imgRef} src={src} alt={alt} loading={loading} className={imgClassName} />
      <div
        className="mv-mosaic mv-mosaic--still"
        aria-hidden="true"
        style={{
          ["--mv-mosaic-cols" as string]: String(grid.cols),
          ["--mv-mosaic-rows" as string]: String(grid.rows),
        }}
      >
        <canvas ref={canvasRef} className="mv-mosaic__canvas" />
      </div>
    </div>
  );
}
