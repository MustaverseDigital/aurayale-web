import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 根據卡片 ID 生成圖片路徑
 * - ID < 100：顯示 `/img/card-img/XXX_00.png`（例如：7 → `/img/card-img/007_00.png`）
 * - ID >= 100：顯示 `/img/card-img/XXX_YY.png`（例如：104 → `/img/card-img/004_01.png`，204 → `/img/card-img/004_02.png`）
 *
 * @param cardId - 卡片 ID（數字或字串）
 * @returns 圖片路徑
 */
export function getCardImagePath(cardId: number | string): string {
  const id = typeof cardId === 'string' ? parseInt(cardId, 10) : cardId;

  // 如果 ID < 100，使用標準圖片路徑（格式：XXX_00.png）
  if (id < 100) {
    return `/img/card-img/${id.toString().padStart(3, '0')}_00.png`;
  }

  // 如果 ID >= 100，解析升級卡片
  // 百位數 = 升級等級（1 = 第一次升級，2 = 第二次升級）
  // 後兩位 = 原始卡片 ID
  const upgradeLevel = Math.floor(id / 100);
  const baseCardId = id % 100;

  return `/img/card-img/${baseCardId.toString().padStart(3, '0')}_${upgradeLevel
    .toString()
    .padStart(2, '0')}.png`;
}
