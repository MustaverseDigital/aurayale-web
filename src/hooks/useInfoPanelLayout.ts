import { useEffect, useState } from "react";

/**
 * 計算桌機版資訊面板(右側 Side Panel)的位置與寬度。
 *
 * Unity 遊戲畫面為 9:16 直式比例,水平置中於畫面。
 * 當左右兩側有足夠空白(>= MIN_PANEL_WIDTH + PADDING*2)時,
 * 啟用桌機版的右側面板模式;否則退回行動裝置的全畫面 Modal 模式。
 *
 * 同樣的 layout 也會被 FloatingMenuButton 取用,讓收合時的 list 按鈕
 * 正好定位在右側面板的中心位置,呈現「縮成右側 list 按鈕」的視覺。
 */

const PADDING = 16;
const MIN_PANEL_WIDTH = 320;
const MAX_PANEL_WIDTH = 460;
const BUTTON_SIZE = 56;
const BOTTOM_RESERVED = 96; // 預留給 Watch Ad 按鈕的空間

export interface InfoPanelLayout {
  /** 是否啟用桌機版右側面板模式 */
  isSidePanel: boolean;
  /** 面板左上角 x 座標(px) */
  panelLeft: number;
  /** 面板上邊界 y 座標(px) */
  panelTop: number;
  /** 面板寬度(px) */
  panelWidth: number;
  /** 面板高度(px) */
  panelHeight: number;
  /** 收合時 list 按鈕的 x 座標(px) */
  buttonLeft: number;
  /** 收合時 list 按鈕的 y 座標(px) */
  buttonTop: number;
  /** 按鈕大小(px) */
  buttonSize: number;
}

const DEFAULT_LAYOUT: InfoPanelLayout = {
  isSidePanel: false,
  panelLeft: 0,
  panelTop: 0,
  panelWidth: 0,
  panelHeight: 0,
  buttonLeft: 0,
  buttonTop: 0,
  buttonSize: BUTTON_SIZE,
};

function computeLayout(): InfoPanelLayout {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  const w = window.innerWidth;
  const h = window.innerHeight;
  // Unity canvas 寬度與 useCanvasWidth 保持一致(9:16 直式)
  const canvasW = Math.min(h * (9 / 16), w);
  const rightSpace = (w - canvasW) / 2;

  if (rightSpace >= MIN_PANEL_WIDTH + PADDING * 2) {
    const panelWidth = Math.min(rightSpace - PADDING * 2, MAX_PANEL_WIDTH);
    const panelLeft = w - panelWidth - PADDING;
    const panelTop = PADDING;
    const panelHeight = Math.max(h - PADDING - BOTTOM_RESERVED, 320);
    // 收合按鈕定位在面板中心位置的右側,呈現「縮回」的感覺
    const buttonLeft = panelLeft + panelWidth - BUTTON_SIZE;
    const buttonTop = panelTop + panelHeight / 2 - BUTTON_SIZE / 2;
    return {
      isSidePanel: true,
      panelLeft,
      panelTop,
      panelWidth,
      panelHeight,
      buttonLeft,
      buttonTop,
      buttonSize: BUTTON_SIZE,
    };
  }
  return DEFAULT_LAYOUT;
}

export function useInfoPanelLayout(): InfoPanelLayout {
  // 用 lazy initializer 在 client 第一次 render 即同步算出正確 layout,
  // 讓 FloatingMenuButton 等子元件能在 mount 時就拿到 isSidePanel/buttonLeft/buttonTop。
  const [layout, setLayout] = useState<InfoPanelLayout>(computeLayout);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setLayout(computeLayout());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return layout;
}
