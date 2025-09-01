import { useEffect, useState } from 'react';

/**
 * 獲取正確的視窗高度，考慮移動端瀏覽器的安全區域
 * 特別針對 Safari 等瀏覽器的底部導航欄進行優化
 */
export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState<number>(800);
  const [safeAreaInsetBottom, setSafeAreaInsetBottom] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateViewportHeight = () => {
      // 使用 visualViewport API (更準確，但不是所有瀏覽器都支援)
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      } else {
        // 回退到 innerHeight
        setViewportHeight(window.innerHeight);
      }

      // 嘗試獲取安全區域底部間距
      try {
        const safeAreaBottom = parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('env(safe-area-inset-bottom)')
            .replace('px', '') || '0'
        );
        setSafeAreaInsetBottom(safeAreaBottom);
      } catch (error) {
        // 如果無法獲取，設為 0
        setSafeAreaInsetBottom(0);
      }
    };

    // 初始化
    updateViewportHeight();

    // 監聽視窗變化
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);
    
    // 如果支援 visualViewport，也監聽它的變化
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight);
    }

    // 延遲檢查，處理一些瀏覽器的非同步行為
    const timeoutId = setTimeout(updateViewportHeight, 100);

    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight);
      }
      clearTimeout(timeoutId);
    };
  }, []);

  // 返回調整後的視窗高度（減去安全區域）
  const adjustedHeight = Math.max(viewportHeight - safeAreaInsetBottom, 400);

  return {
    viewportHeight: adjustedHeight,
    rawViewportHeight: viewportHeight,
    safeAreaInsetBottom,
  };
}
