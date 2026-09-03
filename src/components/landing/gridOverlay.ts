import { VIGNETTE } from "./mosaic";

/**
 * 主視覺上的大格線層（對照 Titanfall 那張 HUD 拼貼）。
 *
 * 三個組成：
 * - 不等寬的大格子，每格有各自的亮度偏移，並各自用不同的週期緩慢起伏，
 *   看起來像不同曝光的畫面被拼在一起
 * - 格線，只畫在格子邊界上
 * - 部分交叉點上的十字定位標記（不是每個都畫，太滿會變成方格紙）
 *
 * 越靠近畫面四周越淡：可見度用與影片暈影同一組橢圓幾何算（見 mosaic.ts 的
 * VIGNETTE），所以格線消失的位置和畫面淡出的位置是對齊的。
 */

/** 目標格子邊長（CSS px）。這是「大格子」，比網版的格子大一個量級。 */
const TILE_TARGET = 190;
const TILE_TARGET_NARROW = 118;
/** 格寬的隨機幅度：0 就是完全等分，太大會有極窄的縫 */
const TILE_JITTER = 0.34;
/** 有多少比例的交叉點會畫十字 */
const CROSS_RATIO = 0.28;

/** 可見度開始衰減、以及完全消失的橢圓半徑（1.0 = 暈影完全透明處） */
const FADE_START = 0.46;
const FADE_END = 1.0;

const LINE_ALPHA = 0.26;
const CROSS_ALPHA = 0.52;
const CROSS_ARM = 11;
/** 每格亮度偏移的上限（相對 0-1 的 alpha） */
const TILE_ALPHA = 0.17;
/**
 * 壓暗的倍率。深色底上「變暗」比「變亮」需要更大的量才看得出同等差異，
 * 所以兩邊不對稱。
 */
const TILE_DARK_SCALE = 1.9;
/**
 * 亮度分佈的兩極化：對 level 取 pow(|x|, POLARITY) 後保留正負號。
 * 小於 1 會把值往 ±1 推 —— 沒有這一步的話每格都擠在中間值附近，
 * 亮暗看起來全部差不多，格子就白切了。
 */
const TILE_POLARITY = 0.55;
/**
 * 亮度的三個來源怎麼配比（總和 1）：
 * - BASE：每格固定的偏移，決定「這格天生比較亮／暗」
 * - WAVE：平滑的正弦起伏，給一層規律的呼吸
 * - NOISE：不規則的雜訊變化，這是讓亮暗看起來像感測訊號而不是動畫的關鍵
 */
const TILE_BASE_MIX = 0.28;
const TILE_WAVE_MIX = 0.24;
const TILE_NOISE_MIX = 0.48;

type Tile = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** -1..1，負的變暗、正的變亮 */
  base: number;
  phase: number;
  speed: number;
  noiseSeed: number;
  noiseSpeed: number;
  vis: number;
};

type Segment = { x1: number; y1: number; x2: number; y2: number; vis: number };
type Cross = { x: number; y: number; vis: number };

export type GridLayout = {
  tiles: Tile[];
  segments: Segment[];
  crosses: Cross[];
};

/** mulberry32：同一個 seed 永遠給同一組版面，重新整理不會跳掉。 */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 整數格點的偽亂數（0..1）。同一組 (i, seed) 永遠回同一個值。 */
function hash1(i: number, seed: number) {
  let h = Math.imul(i ^ seed, 0x27d4eb2d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

/**
 * 一維 value noise：整數格點取亂數，中間用 smoothstep 內插。
 *
 * 刻意不用「每幀取亂數」—— 那會變成頻閃。這裡的值在格點之間是連續的，
 * 所以亮度是「不規則地滑上滑下」，不是抖動。
 */
function valueNoise(t: number, seed: number) {
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * (3 - 2 * f);
  const a = hash1(i, seed);
  const b = hash1(i + 1, seed);
  return a + (b - a) * u;
}

/** 兩個八度疊起來，變化才不會太規律。回傳 -1..1。 */
function tileNoise(t: number, seed: number) {
  const n = valueNoise(t, seed) * 0.65 + valueNoise(t * 2.37, seed ^ 0x9e37) * 0.35;
  return n * 2 - 1;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** 以 VIGNETTE 橢圓為單位算某一點的可見度：中央 1，邊緣 0。 */
function visibilityAt(px: number, py: number, width: number, height: number) {
  const dx = (px / width - VIGNETTE.cx) / VIGNETTE.rx;
  const dy = (py / height - VIGNETTE.cy) / VIGNETTE.ry;
  return 1 - smoothstep(FADE_START, FADE_END, Math.hypot(dx, dy));
}

/** 把 0..total 切成不等寬的段落。 */
function divide(total: number, target: number, random: () => number) {
  const count = Math.max(2, Math.round(total / target));
  const weights: number[] = [];
  let sum = 0;
  for (let i = 0; i < count; i++) {
    const w = 1 + (random() * 2 - 1) * TILE_JITTER;
    weights.push(w);
    sum += w;
  }
  const edges = [0];
  let acc = 0;
  for (let i = 0; i < count; i++) {
    acc += (weights[i] / sum) * total;
    edges.push(Math.round(acc));
  }
  return edges;
}

export function buildGridLayout(width: number, height: number, seed: number): GridLayout {
  const random = rng(seed);
  const target = width < 768 ? TILE_TARGET_NARROW : TILE_TARGET;
  const xs = divide(width, target, random);
  const ys = divide(height, target, random);

  const tiles: Tile[] = [];
  for (let r = 0; r < ys.length - 1; r++) {
    for (let c = 0; c < xs.length - 1; c++) {
      const x = xs[c];
      const y = ys[r];
      const w = xs[c + 1] - x;
      const h = ys[r + 1] - y;
      tiles.push({
        x,
        y,
        w,
        h,
        base: random() * 2 - 1,
        phase: random() * Math.PI * 2,
        // 每格的週期都不同，才不會整片一起呼吸
        speed: 0.00018 + random() * 0.00042,
        noiseSeed: Math.floor(random() * 65536),
        // 約 0.6～1.7 秒換一個雜訊格點：看得出在變，又不會變成閃爍
        noiseSpeed: 0.0006 + random() * 0.0011,
        vis: visibilityAt(x + w / 2, y + h / 2, width, height),
      });
    }
  }

  // 格線：內部的邊界才畫，最外圈本來就在畫面邊緣
  const segments: Segment[] = [];
  for (let c = 1; c < xs.length - 1; c++) {
    for (let r = 0; r < ys.length - 1; r++) {
      segments.push({
        x1: xs[c],
        y1: ys[r],
        x2: xs[c],
        y2: ys[r + 1],
        vis: visibilityAt(xs[c], (ys[r] + ys[r + 1]) / 2, width, height),
      });
    }
  }
  for (let r = 1; r < ys.length - 1; r++) {
    for (let c = 0; c < xs.length - 1; c++) {
      segments.push({
        x1: xs[c],
        y1: ys[r],
        x2: xs[c + 1],
        y2: ys[r],
        vis: visibilityAt((xs[c] + xs[c + 1]) / 2, ys[r], width, height),
      });
    }
  }

  // 十字只挑一部分交叉點，全畫會變成方格紙
  const crosses: Cross[] = [];
  for (let c = 1; c < xs.length - 1; c++) {
    for (let r = 1; r < ys.length - 1; r++) {
      if (random() > CROSS_RATIO) continue;
      crosses.push({
        x: xs[c],
        y: ys[r],
        vis: visibilityAt(xs[c], ys[r], width, height),
      });
    }
  }

  return { tiles, segments, crosses };
}

export function renderGridOverlay(
  ctx: CanvasRenderingContext2D,
  layout: GridLayout,
  width: number,
  height: number,
  now: number
) {
  ctx.clearRect(0, 0, width, height);

  // 每格的亮度偏移。正的疊白、負的疊黑，都用很低的 alpha。
  for (const tile of layout.tiles) {
    if (tile.vis <= 0.01) continue;
    const wave = Math.sin(now * tile.speed + tile.phase);
    const noise = tileNoise(now * tile.noiseSpeed, tile.noiseSeed);
    const raw =
      tile.base * TILE_BASE_MIX + wave * TILE_WAVE_MIX + noise * TILE_NOISE_MIX;
    // 兩極化：把值往 ±1 推，亮的更亮、暗的更暗
    const level = Math.sign(raw) * Math.pow(Math.abs(raw), TILE_POLARITY);
    const alpha = Math.abs(level) * TILE_ALPHA * tile.vis;
    if (alpha < 0.002) continue;
    ctx.fillStyle =
      level > 0
        ? `rgba(238, 230, 216, ${alpha})`
        : `rgba(0, 0, 0, ${alpha * TILE_DARK_SCALE})`;
    ctx.fillRect(tile.x, tile.y, tile.w, tile.h);
  }

  // 格線。逐段畫是因為每一段的可見度不同（越靠邊越淡）。
  ctx.lineWidth = 1;
  for (const seg of layout.segments) {
    if (seg.vis <= 0.02) continue;
    ctx.strokeStyle = `rgba(238, 230, 216, ${LINE_ALPHA * seg.vis})`;
    ctx.beginPath();
    // 0.5 偏移讓 1px 的線落在像素中心，不會糊成 2px
    ctx.moveTo(seg.x1 + 0.5, seg.y1 + 0.5);
    ctx.lineTo(seg.x2 + 0.5, seg.y2 + 0.5);
    ctx.stroke();
  }

  for (const cross of layout.crosses) {
    if (cross.vis <= 0.02) continue;
    ctx.strokeStyle = `rgba(238, 230, 216, ${CROSS_ALPHA * cross.vis})`;
    ctx.beginPath();
    ctx.moveTo(cross.x - CROSS_ARM + 0.5, cross.y + 0.5);
    ctx.lineTo(cross.x + CROSS_ARM + 0.5, cross.y + 0.5);
    ctx.moveTo(cross.x + 0.5, cross.y - CROSS_ARM + 0.5);
    ctx.lineTo(cross.x + 0.5, cross.y + CROSS_ARM + 0.5);
    ctx.stroke();
  }
}
