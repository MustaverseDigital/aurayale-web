import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useViewportHeight } from "../hooks/useViewportHeight";

type ViewportRequirementsState = {
  isPortrait: boolean;
  hasEnoughHeight: boolean;
  isAllowed: boolean;
  viewportHeight: number;
  safeAreaInsetBottom: number;
};

const ViewportRequirementsContext = createContext<ViewportRequirementsState | undefined>(undefined);

export function ViewportRequirementsProvider({ children }: { children: React.ReactNode }) {
  const [isPortrait, setIsPortrait] = useState<boolean>(true);
  const [hasEnoughHeight, setHasEnoughHeight] = useState<boolean>(true);
  const { viewportHeight, safeAreaInsetBottom } = useViewportHeight();

  useEffect(() => {
    if (typeof window === "undefined") return;

    function checkViewport() {
      const portrait = viewportHeight >= window.innerWidth;
      const enoughHeight = viewportHeight >= 400;
      setIsPortrait(portrait);
      setHasEnoughHeight(enoughHeight);
    }

    const delayedCheck = () => {
      setTimeout(checkViewport, 100);
    };

    checkViewport();
    window.addEventListener("resize", delayedCheck);
    window.addEventListener("orientationchange", delayedCheck);
    window.addEventListener("scroll", delayedCheck);
    return () => {
      window.removeEventListener("resize", delayedCheck);
      window.removeEventListener("orientationchange", delayedCheck);
      window.removeEventListener("scroll", delayedCheck);
    };
  }, [viewportHeight]);

  const value = useMemo<ViewportRequirementsState>(() => ({
    isPortrait,
    hasEnoughHeight,
    isAllowed: isPortrait && hasEnoughHeight,
    viewportHeight,
    safeAreaInsetBottom,
  }), [isPortrait, hasEnoughHeight, viewportHeight, safeAreaInsetBottom]);

  return (
    <ViewportRequirementsContext.Provider value={value}>
      {children}
    </ViewportRequirementsContext.Provider>
  );
}

export function useViewportRequirements() {
  const ctx = useContext(ViewportRequirementsContext);
  if (!ctx) throw new Error("useViewportRequirements must be used within ViewportRequirementsProvider");
  return ctx;
}


