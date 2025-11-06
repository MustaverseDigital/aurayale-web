import { useEffect, useState } from "react";

/**
 * 計算 Unity canvas 寬度，使用 9:16 直式比例
 * 確保在不同頁面間保持一致的視窗尺寸
 * @param viewportHeight - 視窗高度，通常來自 useViewportRequirements
 * @returns canvasWidth - 計算後的 canvas 寬度
 */
export function useCanvasWidth(viewportHeight: number) {
  const [canvasWidth, setCanvasWidth] = useState(() => {
    if (typeof window !== "undefined") {
      const initialHeight = viewportHeight || window.innerHeight || 800;
      return Math.min(initialHeight * (9 / 16), window.innerWidth);
    }
    return 0;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const calculateWidth = () => {
        const portraitWidth = viewportHeight * (9 / 16);
        const maxWidth = window.innerWidth;
        setCanvasWidth(Math.min(portraitWidth, maxWidth));
      };
      calculateWidth();
      window.addEventListener("resize", calculateWidth);
      return () => window.removeEventListener("resize", calculateWidth);
    }
  }, [viewportHeight]);

  return canvasWidth;
}

