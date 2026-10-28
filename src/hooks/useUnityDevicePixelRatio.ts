import { useEffect, useState } from "react";

export const MOBILE_UNITY_DPR_CAP = 1.5;
export const MOBILE_UNITY_PIXEL_BUDGET = 1_000_000;

const MIN_DIAGNOSTIC_DPR = 0.75;
const MAX_DIAGNOSTIC_DPR = 3;
const MOBILE_SHORT_SIDE_LIMIT = 1024;

export type UnityDprSnapshot = {
  rawDevicePixelRatio: number;
  effectiveDevicePixelRatio: number;
  isMobileViewport: boolean;
  overrideDevicePixelRatio: number | null;
  cssWidth: number;
  cssHeight: number;
  renderWidth: number;
  renderHeight: number;
  renderPixels: number;
};

type UnityDprCalculation = {
  rawDevicePixelRatio: number;
  isMobileViewport: boolean;
  cssWidth: number;
  cssHeight: number;
  overrideDevicePixelRatio?: number | null;
  mobileDprCap?: number;
  mobilePixelBudget?: number;
};

type UseUnityDevicePixelRatioOptions = {
  canvasWidth: number;
  canvasHeight: number;
};

function normalisePositive(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function roundDpr(value: number) {
  return Math.round(value * 1000) / 1000;
}

function floorDpr(value: number) {
  return Math.floor(value * 1000) / 1000;
}

/**
 * Allows a bounded diagnostic override such as `?unityDpr=1` or
 * `?unityDpr=1.5`. It is intentionally not persisted between visits.
 */
export function parseUnityDprOverride(search: string): number | null {
  const raw = new URLSearchParams(search).get("unityDpr");
  if (raw == null || raw.trim() === "") return null;

  const value = Number(raw);
  if (!Number.isFinite(value) || value < MIN_DIAGNOSTIC_DPR || value > MAX_DIAGNOSTIC_DPR) {
    return null;
  }
  return roundDpr(value);
}

/** Pure calculation kept separate so the phone render budget is unit-testable. */
export function calculateUnityDpr({
  rawDevicePixelRatio,
  isMobileViewport,
  cssWidth,
  cssHeight,
  overrideDevicePixelRatio = null,
  mobileDprCap = MOBILE_UNITY_DPR_CAP,
  mobilePixelBudget = MOBILE_UNITY_PIXEL_BUDGET,
}: UnityDprCalculation): UnityDprSnapshot {
  const rawDpr = normalisePositive(rawDevicePixelRatio, 1);
  const width = normalisePositive(cssWidth, 1);
  const height = normalisePositive(cssHeight, 1);

  let effectiveDpr = rawDpr;
  if (overrideDevicePixelRatio != null) {
    effectiveDpr = overrideDevicePixelRatio;
  } else if (isMobileViewport) {
    const cssPixels = width * height;
    const pixelBudgetDpr = Math.sqrt(normalisePositive(mobilePixelBudget, MOBILE_UNITY_PIXEL_BUDGET) / cssPixels);
    effectiveDpr = Math.min(rawDpr, normalisePositive(mobileDprCap, MOBILE_UNITY_DPR_CAP), pixelBudgetDpr);
  }

  effectiveDpr = normalisePositive(effectiveDpr, 1);
  // Rounding a budget-derived value upward can put the backing buffer just
  // over budget. Diagnostic overrides and desktop DPRs retain normal rounding.
  effectiveDpr = isMobileViewport && overrideDevicePixelRatio == null
    ? Math.max(MIN_DIAGNOSTIC_DPR, floorDpr(effectiveDpr))
    : roundDpr(effectiveDpr);
  const renderWidth = Math.max(1, Math.round(width * effectiveDpr));
  const renderHeight = Math.max(1, Math.round(height * effectiveDpr));

  return {
    rawDevicePixelRatio: rawDpr,
    effectiveDevicePixelRatio: effectiveDpr,
    isMobileViewport,
    overrideDevicePixelRatio,
    cssWidth: width,
    cssHeight: height,
    renderWidth,
    renderHeight,
    renderPixels: renderWidth * renderHeight,
  };
}

function isSameSnapshot(a: UnityDprSnapshot, b: UnityDprSnapshot) {
  return a.rawDevicePixelRatio === b.rawDevicePixelRatio
    && a.effectiveDevicePixelRatio === b.effectiveDevicePixelRatio
    && a.isMobileViewport === b.isMobileViewport
    && a.overrideDevicePixelRatio === b.overrideDevicePixelRatio
    && a.cssWidth === b.cssWidth
    && a.cssHeight === b.cssHeight
    && a.renderWidth === b.renderWidth
    && a.renderHeight === b.renderHeight;
}

function readBrowserSnapshot(canvasWidth: number, canvasHeight: number): UnityDprSnapshot {
  if (typeof window === "undefined") {
    return calculateUnityDpr({
      rawDevicePixelRatio: 1,
      isMobileViewport: false,
      cssWidth: canvasWidth || 1,
      cssHeight: canvasHeight || 1,
    });
  }

  let hasCoarsePointer = false;
  let pointerCapabilityKnown = false;
  try {
    if (typeof window.matchMedia === "function") {
      hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
      pointerCapabilityKnown = true;
    }
  } catch {
    // Browsers without matchMedia still fall back to maxTouchPoints below.
  }

  const viewportWidth = normalisePositive(window.innerWidth, canvasWidth || 1);
  const viewportHeight = normalisePositive(window.innerHeight, canvasHeight || 1);
  const hasTouch = (window.navigator.maxTouchPoints || 0) > 0;
  const isMobileViewport = Math.min(viewportWidth, viewportHeight) <= MOBILE_SHORT_SIDE_LIMIT
    && (pointerCapabilityKnown ? hasCoarsePointer : hasTouch);

  return calculateUnityDpr({
    rawDevicePixelRatio: window.devicePixelRatio || 1,
    isMobileViewport,
    cssWidth: canvasWidth || viewportWidth,
    cssHeight: canvasHeight || viewportHeight,
    overrideDevicePixelRatio: parseUnityDprOverride(window.location.search),
  });
}

function subscribeMediaQuery(query: MediaQueryList | null, listener: () => void) {
  if (query == null) return () => undefined;
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }

  // Older iOS Safari exposes the legacy MediaQueryList listener API.
  query.addListener(listener);
  return () => query.removeListener(listener);
}

/**
 * Keeps desktop rendering unchanged while capping phone render-target memory.
 * The result responds to orientation, browser chrome and display-DPR changes.
 */
export function useUnityDevicePixelRatio({ canvasWidth, canvasHeight }: UseUnityDevicePixelRatioOptions) {
  const [snapshot, setSnapshot] = useState<UnityDprSnapshot>(() => readBrowserSnapshot(canvasWidth, canvasHeight));

  useEffect(() => {
    let resolutionQuery: MediaQueryList | null = null;
    let unsubscribeResolution: () => void = () => undefined;

    const update = () => {
      const next = readBrowserSnapshot(canvasWidth, canvasHeight);
      setSnapshot((current) => isSameSnapshot(current, next) ? current : next);

      const nextQueryText = `(resolution: ${next.rawDevicePixelRatio}dppx)`;
      if (resolutionQuery?.media === nextQueryText) return;
      unsubscribeResolution();
      try {
        resolutionQuery = window.matchMedia(nextQueryText);
        unsubscribeResolution = subscribeMediaQuery(resolutionQuery, update);
      } catch {
        resolutionQuery = null;
        unsubscribeResolution = () => undefined;
      }
    };

    let coarsePointerQuery: MediaQueryList | null = null;
    try {
      coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    } catch {
      coarsePointerQuery = null;
    }
    const unsubscribeCoarsePointer = subscribeMediaQuery(coarsePointerQuery, update);

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.visualViewport?.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);
      unsubscribeCoarsePointer();
      unsubscribeResolution();
    };
  }, [canvasWidth, canvasHeight]);

  return snapshot;
}
