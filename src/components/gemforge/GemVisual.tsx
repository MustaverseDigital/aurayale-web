import { ELEMENT_META, RARITY_META, type ForgedGem } from "@/lib/gemForge";

/**
 * 寶石占位視覺（企劃 04：視覺產出方式暫定留空）。
 *
 * 這個元件是「視覺產出」的抽換點：目前以屬性驅動的 SVG 切面寶石呈現
 * （元素決定色相、稀有度決定光暈與碎鑽數量），之後不論改接 AI 生圖
 * 或規則式美術，只要替換這個元件的內部實作即可，props 介面不變。
 */
export function GemVisual({ gem, size = 180 }: { gem: ForgedGem; size?: number }) {
  const { color } = ELEMENT_META[gem.element];
  const rarityColor = RARITY_META[gem.rarity].color;
  const sparkles = { common: 0, rare: 2, epic: 4, legendary: 6 }[gem.rarity];

  // 依稀有度加強光暈
  const glow = {
    common: `drop-shadow(0 0 10px ${color}66)`,
    rare: `drop-shadow(0 0 16px ${color}88)`,
    epic: `drop-shadow(0 0 22px ${color}aa)`,
    legendary: `drop-shadow(0 0 30px ${color}cc)`,
  }[gem.rarity];

  const sparklePositions = [
    { x: 38, y: 42, r: 2.4 },
    { x: 164, y: 58, r: 1.8 },
    { x: 150, y: 148, r: 2.2 },
    { x: 46, y: 140, r: 1.6 },
    { x: 100, y: 24, r: 2.6 },
    { x: 172, y: 108, r: 1.5 },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{ filter: glow }}
      className="gem-visual-float"
      role="img"
      aria-label={`${gem.name}（${ELEMENT_META[gem.element].label}屬性寶石）`}
    >
      {/* 主體輪廓 */}
      <polygon points="62,52 138,52 178,92 100,182 22,92" fill={color} opacity="0.92" />
      {/* 冠部切面 */}
      <polygon points="62,52 138,52 122,92 78,92" fill="#ffffff" opacity="0.32" />
      <polygon points="62,52 78,92 22,92" fill="#000000" opacity="0.18" />
      <polygon points="138,52 178,92 122,92" fill="#ffffff" opacity="0.14" />
      {/* 亭部切面 */}
      <polygon points="78,92 122,92 100,182" fill="#ffffff" opacity="0.2" />
      <polygon points="22,92 78,92 100,182" fill="#000000" opacity="0.24" />
      <polygon points="122,92 178,92 100,182" fill="#000000" opacity="0.1" />
      {/* 腰線 */}
      <polyline points="22,92 178,92" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.5" fill="none" />
      {/* 高光 */}
      <polygon points="72,58 92,58 82,80" fill="#ffffff" opacity="0.75" />
      {/* 稀有度碎鑽 */}
      {sparklePositions.slice(0, sparkles).map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={rarityColor} opacity="0.9" />
      ))}
    </svg>
  );
}
