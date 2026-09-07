/**
 * 內容圖馬賽克格的共用運算（見 MosaicImage）。
 *
 * 作法是把來源畫到一張「一個像素等於一格」的小 canvas 上，再用
 * image-rendering: pixelated 放大回來。所以格子的顏色就是該區域的平均色，
 * 是真的馬賽克，不是貼一層假格線。
 *
 * 主視覺不走這裡 —— 那是 GPU 上的極座標隧道，見 tunnel.ts。
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
 * 只做去彩度，不加色偏。
 *
 * 內容圖是用來說明內容的，撒上來源本來沒有的色斑只會讓圖變髒。
 *
 * saturation：0 = 全灰，1 = 完全保留來源的顏色。
 */
export function applySaturation(data: Uint8ClampedArray, saturation: number) {
  if (saturation === 1) return;
  for (let p = 0; p < data.length; p += 4) {
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    data[p] = lum + (r - lum) * saturation;
    data[p + 1] = lum + (g - lum) * saturation;
    data[p + 2] = lum + (b - lum) * saturation;
  }
}
