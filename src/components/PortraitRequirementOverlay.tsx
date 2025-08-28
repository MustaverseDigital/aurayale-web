import React from "react";
import { useViewportRequirements } from "../context/ViewportRequirementsContext";

export default function PortraitRequirementOverlay() {
  const { isAllowed } = useViewportRequirements();
  if (isAllowed) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="px-6 py-4 rounded-lg bg-black/70 text-white text-center text-lg shadow-xl">
        請使用直式畫面並確保螢幕高度足夠以獲得最佳體驗
      </div>
    </div>
  );
}


