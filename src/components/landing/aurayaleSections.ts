import type { NextRouter } from "next/router";

/**
 * Aurayale 頁面的 section 錨點清單，供導覽列彈出選單列出並滾動到對應段落。
 * id 對應 src/pages/aurayale.tsx 各 <section id="..."> 。
 */
export const AURAYALE_SECTIONS: { id: string; label: string }[] = [
  { id: "home", label: "Home" },
  // { id: "hot-games", label: "HOT Games" }, // 暫時隱藏
  { id: "gem-cuts", label: "Gem Cuts" },
  { id: "swup-system", label: "SwUp System" },
  { id: "awards", label: "Awards" },
];

/**
 * 滾動到 aurayale 頁面的指定 section。
 * - 已在 /aurayale：直接平滑滾動到該錨點。
 * - 不在 /aurayale：先導頁到 /aurayale#id，由頁面載入後處理錨點。
 */
export function scrollToAurayaleSection(router: NextRouter, id: string) {
  const onAurayale = router.pathname === "/aurayale";
  if (onAurayale) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  }
  // 跨頁：導到 /aurayale 並帶上 hash，交給目的頁的 hash 處理。
  void router.push(`/aurayale#${id}`);
}
