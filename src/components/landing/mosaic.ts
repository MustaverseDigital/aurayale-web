/**
 * 馬賽克格的共用運算。HeroMedia（影片、會跳動）與 MosaicImage（靜態圖）都走這裡，
 * 兩邊的格子密度與色偏規則才會一致。
 *
 * 作法是把來源畫到一張「一個像素等於一格」的小 canvas 上，再用
 * image-rendering: pixelated 放大回來。所以格子的顏色就是該區域的平均色，
 * 是真的馬賽克，不是貼一層假格線。
 */

/** 目標格子邊長（CSS px）。窄螢幕會自動縮小，免得格子大到看不出是什麼。 */
const CELL_MIN = 12;
const CELL_MAX = 26;
/** 大約要橫向切幾格，用來把格子邊長換算到當下的寬度 */
const CELL_DIVISOR = 58;

export type Grid = { cols: number; rows: number };

/** 依實際尺寸決定格數，讓格子在各種螢幕上都維持接近正方形。 */
export function computeGrid(width: number, height: number): Grid {
  const cell = Math.min(CELL_MAX, Math.max(CELL_MIN, width / CELL_DIVISOR));
  return {
    cols: Math.max(12, Math.round(width / cell)),
    rows: Math.max(8, Math.round(height / cell)),
  };
}

export function sameGrid(a: Grid, b: Grid) {
  return a.cols === b.cols && a.rows === b.rows;
}

/** 字串轉成一個穩定的種子，讓每張圖的色偏分佈不同，不會整站疊出同一塊花紋。 */
export function seedFrom(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 9973;
}

/**
 * 每一格配一個固定色相。相鄰格之間刻意沒有規律，才會像參考圖那樣
 * 一塊一塊各自偏色，而不是整片漸層。
 */
export function buildHues(cols: number, rows: number, seed: number) {
  const hues = new Float32Array(cols * rows);
  for (let i = 0; i < hues.length; i++) {
    const n = Math.sin((i + seed) * 12.9898) * 43758.5453;
    hues[i] = (n - Math.floor(n)) * Math.PI * 2;
  }
  return hues;
}

/**
 * 把來源依 object-fit: cover 的裁切方式畫進小 canvas。
 * 不對齊這個裁切的話，格子會和底下顯示的畫面錯開一段。
 */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceW: number,
  sourceH: number,
  boxW: number,
  boxH: number,
  grid: Grid,
  alpha = 1
) {
  const scale = Math.max(boxW / sourceW, boxH / sourceH);
  const sw = boxW / scale;
  const sh = boxH / scale;
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    source,
    (sourceW - sw) / 2,
    (sourceH - sh) / 2,
    sw,
    sh,
    0,
    0,
    grid.cols,
    grid.rows
  );
}

/**
 * 主視覺的橢圓暈影。影片的淡出遮罩與色偏的環狀權重共用這一組數字，
 * 兩邊才會精準對齊 —— 色偏就落在「畫面淡出的那一圈交界」上。
 *
 * cx/cy 是圓心（佔畫面比例），rx/ry 是半徑，solid 之內完全不透明、
 * 到 1.0 完全透明。ringCenter / ringWidth 定義色偏最強的那一圈。
 */
export const VIGNETTE = {
  cx: 0.5,
  cy: 0.46,
  rx: 0.58,
  ry: 0.58,
  solid: 0.3,
  ringCenter: 0.72,
  ringWidth: 0.38,
};

/**
 * 上緣不上色：導覽列下方這一段的色偏整個關掉，往下再平滑接回來。
 * 主視覺頂端是最先看到的地方，那裡浮出彩色格子會顯得髒。
 */
const TOP_GATE_START = 0.18;
const TOP_GATE_END = 0.46;

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * 每一格的色偏權重：畫面中央 0、淡出交界最強、畫面外緣再收回 0，
 * 上緣另外整段關掉。所以顏色只會落在左右兩側與下緣的那一圈交界上。
 */
export function buildRingWeights(cols: number, rows: number) {
  const weights = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    const gate = smoothstep(TOP_GATE_START, TOP_GATE_END, (y + 0.5) / rows);
    for (let x = 0; x < cols; x++) {
      // 換算成「以 VIGNETTE 橢圓為單位」的半徑：1.0 就是遮罩完全透明的位置
      const dx = ((x + 0.5) / cols - VIGNETTE.cx) / VIGNETTE.rx;
      const dy = ((y + 0.5) / rows - VIGNETTE.cy) / VIGNETTE.ry;
      const radius = Math.hypot(dx, dy);
      const t = (radius - VIGNETTE.ringCenter) / VIGNETTE.ringWidth;
      const falloff = Math.abs(t) >= 1 ? 0 : Math.cos((t * Math.PI) / 2);
      weights[y * cols + x] = falloff * falloff * gate;
    }
  }
  return weights;
}

/** 掃描帶本身的寬度（沿掃描軸，整條軸長為 1） */
const SWEEP_WIDTH = 0.14;
/** 帶通過之後殘留的拖尾長度 */
const SWEEP_TRAIL = 0.46;
/** 帶還沒掃到的地方保留多少色偏，0 會變成只有一條線在跑 */
const SWEEP_FLOOR = 0.34;

/**
 * 掃描帶。像 Blender 算圖時一格一格 render 過去那樣：帶掃到的地方色偏最強，
 * 帶後拖一段尾巴慢慢衰減回底線，其餘維持 SWEEP_FLOOR。
 * 斜著走（x 權重高於 y），比純水平或純垂直有機一些。
 *
 * 結果寫進 target，避免每一幀都配置新的陣列。
 */
export function applySweep(
  target: Float32Array,
  base: Float32Array,
  cols: number,
  rows: number,
  phase: number
) {
  for (let y = 0; y < rows; y++) {
    const v = (y / rows) * 0.38;
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const weight = base[i];
      if (weight === 0) {
        target[i] = 0;
        continue;
      }
      // 沿斜軸投影後取到掃描頭的距離，往回 wrap 成 0..1
      const u = (x / cols) * 0.62 + v;
      let behind = phase - u;
      behind -= Math.floor(behind);

      let boost: number;
      if (behind < SWEEP_WIDTH) {
        boost = 1;
      } else if (behind < SWEEP_WIDTH + SWEEP_TRAIL) {
        boost = 1 - (behind - SWEEP_WIDTH) / SWEEP_TRAIL;
      } else {
        boost = 0;
      }
      target[i] = weight * (SWEEP_FLOOR + (1 - SWEEP_FLOOR) * boost);
    }
  }
}

const THIRD_TURN = (Math.PI * 2) / 3;

/**
 * 色相偏差。三個通道各自沿著相隔 120° 的方向偏移，總和接近 0，所以亮度不變、
 * 只是注入彩度；彩度在中間調最強、往全黑與全白收斂到 0 —— 這就是參考圖那種
 * 「暗部與亮部維持中性，中間調浮出粉綠粉紫格子」的效果。
 *
 * saturation：0 = 先壓成灰階再上色（黑白圖），1 = 完全保留來源的顏色，
 *             中間值就是「還原一部分原本色彩」。
 * weights：每格的色偏權重，用來讓顏色只出現在特定區域（主視覺的淡出交界）。
 */
export function applyChroma(
  data: Uint8ClampedArray,
  hues: Float32Array,
  strength: number,
  options: { saturation: number; drift?: number; weights?: Float32Array }
) {
  const { saturation, drift = 0, weights } = options;
  for (let cell = 0, p = 0; p < data.length; cell++, p += 4) {
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const weight = weights ? weights[cell] : 1;
    const falloff = Math.sin((lum / 255) * Math.PI);
    const chroma = strength * falloff * falloff * weight;
    const hue = hues[cell] + drift;
    // Uint8ClampedArray 會自己夾在 0..255，不需要另外做 clamp
    data[p] = lum + (r - lum) * saturation + chroma * Math.cos(hue);
    data[p + 1] = lum + (g - lum) * saturation + chroma * Math.cos(hue - THIRD_TURN);
    data[p + 2] = lum + (b - lum) * saturation + chroma * Math.cos(hue + THIRD_TURN);
  }
}
