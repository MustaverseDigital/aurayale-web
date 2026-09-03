import { applySweep, buildRingWeights, type Grid } from "./mosaic";

/**
 * 主視覺的網版演算。
 *
 * 三種圖樣，共用同一條管線：影片先降採樣成「一個像素等於一格」的小圖，
 * 讀出每格亮度後再決定要畫什麼。
 *
 * - dot   ：圓點網版。點的直徑隨亮度變化 —— 這才是真正的 halftone，
 *           先前用 CSS radial-gradient 疊的網點是固定大小的，不會隨明暗變。
 * - cross ：十字網版。與 DesignRef 那張 banner 同一種做法，暗部只剩細小的
 *           十字，亮部的十字撐大到互相連成一片。
 * - dither：有序抖動（Bayer 8×8）。輸出只有黑與亮兩色，靠疏密表現灰階，
 *           放大時用 image-rendering: pixelated 保留硬邊。
 *
 * 效能上刻意讓 dot / cross 只呼叫一次 fill()：所有標記先累積進同一條路徑，
 * 上萬個格子也只是一次繪製。顏色則用 source-atop 疊一張小圖上去，
 * 一次 drawImage 就把色偏套到所有標記上，不需要逐格換 fillStyle。
 */

export type HalftonePattern = "dot" | "cross" | "dither";

/** 各圖樣的格子邊長（CSS px）。dither 要細很多才會有抖動的感覺。 */
const CELL_SIZE: Record<HalftonePattern, number> = {
  dot: 10,
  cross: 12,
  dither: 3,
};

/** 標記的基準色。網版的亮度靠「標記大小」表現，不是靠標記本身的明暗。 */
const MARK_RGB = [238, 232, 220] as const;
const MARK_LUM = 0.2126 * MARK_RGB[0] + 0.7152 * MARK_RGB[1] + 0.0722 * MARK_RGB[2];

/**
 * 標記要吃回多少影片原本的顏色（0 = 全中性，1 = 完全跟著來源）。
 * 關鍵在下面 sampleMarkColor 的正規化：只取色相與彩度，亮度一律拉回
 * MARK_LUM。網版是靠標記「大小」表現明暗的，如果連顏色也跟著變暗，
 * 暗部的標記會直接看不見，等於把灰階資訊算了兩次。
 */
const MARK_SOURCE_MIX = 0.6;
/** 來源影片本身偏灰，正規化後再拉一點彩度，顏色才讀得出來。
    dither 的亮點數量遠多於圓點／十字，這個值太高整片會過飽和。 */
const MARK_SOURCE_BOOST = 1.25;

/** 把某一格的來源色正規化成「同樣亮度、保留色相」的標記色，寫進 out。 */
function sampleMarkColor(r: number, g: number, b: number, out: Float32Array) {
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // 太暗的格子沒有可靠的色相可取，直接用中性色
  if (lum < 10) {
    out[0] = MARK_RGB[0];
    out[1] = MARK_RGB[1];
    out[2] = MARK_RGB[2];
    return;
  }
  const scale = MARK_LUM / lum;
  const nr = MARK_LUM + (r * scale - MARK_LUM) * MARK_SOURCE_BOOST;
  const ng = MARK_LUM + (g * scale - MARK_LUM) * MARK_SOURCE_BOOST;
  const nb = MARK_LUM + (b * scale - MARK_LUM) * MARK_SOURCE_BOOST;
  out[0] = MARK_RGB[0] + (nr - MARK_RGB[0]) * MARK_SOURCE_MIX;
  out[1] = MARK_RGB[1] + (ng - MARK_RGB[1]) * MARK_SOURCE_MIX;
  out[2] = MARK_RGB[2] + (nb - MARK_RGB[2]) * MARK_SOURCE_MIX;
}

/** 逐格計算時共用的暫存，避免在熱迴圈裡每格配置一個陣列 */
const markScratch = new Float32Array(3);

/** 亮度到標記大小的 gamma。大於 1 會壓暗部，讓畫面不會糊成一片。 */
const SIZE_GAMMA = 1.15;

/** 掃描帶讓標記略為脹縮，即使影片靜止也看得出在動。 */
const SWEEP_SIZE_RANGE = 0.26;

const TAU = Math.PI * 2;
const THIRD_TURN = TAU / 3;

/** 8×8 有序抖動矩陣（標準 Bayer），值域 0..63。 */
const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

export function cellSizeFor(pattern: HalftonePattern, viewportWidth: number) {
  // 窄螢幕把格子縮小，否則格子相對畫面太大會看不出原本拍了什麼
  const scale = viewportWidth < 768 ? 0.75 : 1;
  return Math.max(3, Math.round(CELL_SIZE[pattern] * scale));
}

export function gridFor(pattern: HalftonePattern, width: number, height: number): Grid {
  const cell = cellSizeFor(pattern, width);
  return {
    cols: Math.max(8, Math.ceil(width / cell)),
    rows: Math.max(6, Math.ceil(height / cell)),
  };
}

/** dither 直接把每格畫成一個像素再放大，其餘圖樣要在實際尺寸上畫標記。 */
export function canvasSizeFor(
  pattern: HalftonePattern,
  grid: Grid,
  width: number,
  height: number
) {
  if (pattern === "dither") return { width: grid.cols, height: grid.rows };
  // 上限避免超寬螢幕開出過大的 backing store；標記本來就是粗的，不需要 DPR 2
  const capped = Math.min(width, 1600);
  return { width: Math.round(capped), height: Math.round((capped / width) * height) };
}

/**
 * 每格標記要用的顏色：基準色加上色偏。做成一張 cols×rows 的小圖，
 * 之後用 source-atop 一次疊上去。
 */
export function paintTint(
  data: Uint8ClampedArray,
  source: Uint8ClampedArray,
  hues: Float32Array,
  weights: Float32Array,
  strength: number,
  drift: number
) {
  for (let cell = 0, p = 0; p < data.length; cell++, p += 4) {
    sampleMarkColor(source[p], source[p + 1], source[p + 2], markScratch);
    const chroma = strength * weights[cell];
    const hue = hues[cell] + drift;
    data[p] = markScratch[0] + chroma * Math.cos(hue);
    data[p + 1] = markScratch[1] + chroma * Math.cos(hue - THIRD_TURN);
    data[p + 2] = markScratch[2] + chroma * Math.cos(hue + THIRD_TURN);
    data[p + 3] = 255;
  }
}

/**
 * 畫圓點或十字。所有標記累積進同一條路徑，最後只 fill 一次。
 * sweep 傳入時會讓標記隨掃描帶略為脹縮。
 */
export function renderMarks(
  ctx: CanvasRenderingContext2D,
  source: Uint8ClampedArray,
  grid: Grid,
  pattern: "dot" | "cross",
  cellW: number,
  cellH: number,
  sweep: Float32Array | null
) {
  ctx.beginPath();
  for (let y = 0; y < grid.rows; y++) {
    const cy = (y + 0.5) * cellH;
    for (let x = 0; x < grid.cols; x++) {
      const cell = y * grid.cols + x;
      const p = cell * 4;
      const lum =
        (0.2126 * source[p] + 0.7152 * source[p + 1] + 0.0722 * source[p + 2]) / 255;
      let size = Math.pow(lum, SIZE_GAMMA);
      if (sweep) size *= 1 - SWEEP_SIZE_RANGE / 2 + SWEEP_SIZE_RANGE * sweep[cell];
      // 太小的標記畫出來只是雜點，直接跳過，暗部才留得住
      if (size < 0.07) continue;
      const cx = (x + 0.5) * cellW;

      if (pattern === "dot") {
        const radius = size * cellW * 0.6;
        ctx.moveTo(cx + radius, cy);
        ctx.arc(cx, cy, radius, 0, TAU);
      } else {
        // 十字：亮部的臂長會超過格寬，讓相鄰的十字連成一片
        const arm = size * cellW * 1.5;
        const thickness = Math.max(1, arm * 0.3);
        ctx.rect(cx - arm / 2, cy - thickness / 2, arm, thickness);
        ctx.rect(cx - thickness / 2, cy - arm / 2, thickness, arm);
      }
    }
  }
  ctx.fill();
}

/**
 * 抖動的下手深度（0 = 原影像，1 = 純 1-bit）。
 *
 * 純 1-bit 的抖動每個像素非黑即亮，中間調全部被丟掉，畫面會變成一片雜訊、
 * 認不出原本拍的是什麼。留一部分原影像進來，紋理仍然是抖動的，但主體的
 * 形狀與明暗還讀得出來。
 */
const DITHER_DEPTH = 0.62;

/**
 * 有序抖動。把小圖就地改寫成「抖動結果與原影像的混合」。
 * phase 會位移抖動矩陣，讓圖樣緩慢爬動 —— 這是即使畫面靜止也看得出的動態。
 */
export function renderDither(
  data: Uint8ClampedArray,
  grid: Grid,
  hues: Float32Array,
  weights: Float32Array,
  strength: number,
  drift: number,
  phase: number
) {
  const shiftX = Math.floor(phase * 8) & 7;
  const shiftY = Math.floor(phase * 8 * 0.5) & 7;
  for (let y = 0; y < grid.rows; y++) {
    const by = ((y + shiftY) & 7) << 3;
    for (let x = 0; x < grid.cols; x++) {
      const cell = y * grid.cols + x;
      const p = cell * 4;
      // 先把原值取出來：等一下要拿它跟抖動結果混合
      const sr = data[p];
      const sg = data[p + 1];
      const sb = data[p + 2];
      const lum = (0.2126 * sr + 0.7152 * sg + 0.0722 * sb) / 255;
      const threshold = (BAYER8[by + ((x + shiftX) & 7)] + 0.5) / 64;

      let tr = 0;
      let tg = 0;
      let tb = 0;
      if (Math.pow(lum, SIZE_GAMMA) > threshold) {
        sampleMarkColor(sr, sg, sb, markScratch);
        const chroma = strength * weights[cell];
        const hue = hues[cell] + drift;
        tr = markScratch[0] + chroma * Math.cos(hue);
        tg = markScratch[1] + chroma * Math.cos(hue - THIRD_TURN);
        tb = markScratch[2] + chroma * Math.cos(hue + THIRD_TURN);
      }

      data[p] = sr + (tr - sr) * DITHER_DEPTH;
      data[p + 1] = sg + (tg - sg) * DITHER_DEPTH;
      data[p + 2] = sb + (tb - sb) * DITHER_DEPTH;
      data[p + 3] = 255;
    }
  }
}

export { applySweep, buildRingWeights };
