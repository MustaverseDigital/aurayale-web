import { useEffect, useState } from "react";

/**
 * Unity build 的版本識別。
 *
 * 為什麼要有這個：loader / data / framework / wasm 是四個獨立的快取項目。
 * 過去四個檔名固定（/Build/Build.wasm.unityweb …），瀏覽器對每個檔案各自計算
 * 過期時間，於是新版推上去後玩家可能拿到「新 loader + 舊 wasm」——
 * 版本錯配讓 wasm 實例化失敗，卡在 90% 並拋出
 * `Not implemented: Class::FromIl2CppType` / `Maximum call stack size exceeded`，
 * 非得清快取才能救。
 *
 * 現在改成每次 build 一個 /Build/<buildId>/ 目錄，四個檔案同進同出，不可能混搭。
 * version.json 是唯一一個 no-store 的檔案，用來問「現在最新是哪一版」。
 */
export type UnityBuildVersion = {
  /** 例：20260902-0951-bd10359 */
  buildId: string;
  builtAt?: string;
  variant: "desktop" | "mobile-astc" | "legacy";
  textureCompression: "dxt" | "astc" | "unknown";
  selectionReason: string;
};

type UnityBuildVariantEntry = {
  buildId: string;
  textureCompression: "dxt" | "astc";
  requiresExtension?: string;
  maxTextureSize?: number;
};

export type UnityBuildVersionManifest = {
  buildId: string;
  builtAt?: string;
  variants?: {
    desktop: UnityBuildVariantEntry;
    mobileAstc: UnityBuildVariantEntry;
  };
};

type UnityBuildCapabilities = {
  isMobile: boolean;
  supportsAstc: boolean;
  override?: "desktop" | "mobile-astc" | null;
};

const BUILD_ID_PATTERN = /^\d{8}-\d{4}-[a-z0-9]+$/;
const ASTC_EXTENSION = "WEBGL_compressed_texture_astc";

export function parseUnityBuildOverride(search: string): "desktop" | "mobile-astc" | null {
  const value = new URLSearchParams(search).get("unityBuild");
  return value === "desktop" || value === "mobile-astc" ? value : null;
}

export function selectUnityBuildVersion(
  manifest: UnityBuildVersionManifest,
  { isMobile, supportsAstc, override = null }: UnityBuildCapabilities,
): UnityBuildVersion {
  if (!BUILD_ID_PATTERN.test(manifest?.buildId || ""))
    throw new Error("version.json has an invalid buildId");

  const variants = manifest.variants;
  if (variants == null) {
    return {
      buildId: manifest.buildId,
      builtAt: manifest.builtAt,
      variant: "legacy",
      textureCompression: "unknown",
      selectionReason: "legacy manifest",
    };
  }
  if (!BUILD_ID_PATTERN.test(variants.desktop?.buildId || ""))
    throw new Error("version.json has an invalid desktop buildId");
  if (!BUILD_ID_PATTERN.test(variants.mobileAstc?.buildId || ""))
    throw new Error("version.json has an invalid mobile ASTC buildId");
  if (variants.desktop.textureCompression !== "dxt"
    || variants.mobileAstc.textureCompression !== "astc"
    || variants.mobileAstc.requiresExtension !== ASTC_EXTENSION)
    throw new Error("version.json has invalid texture variant declarations");

  const mobileRequested = override === "mobile-astc" || (override == null && isMobile);
  if (mobileRequested && supportsAstc) {
    return {
      buildId: variants.mobileAstc.buildId,
      builtAt: manifest.builtAt,
      variant: "mobile-astc",
      textureCompression: "astc",
      selectionReason: override === "mobile-astc" ? "diagnostic override with ASTC support" : "mobile browser with ASTC support",
    };
  }

  return {
    buildId: variants.desktop.buildId,
    builtAt: manifest.builtAt,
    variant: "desktop",
    textureCompression: "dxt",
    selectionReason: override === "desktop"
      ? "diagnostic override"
      : mobileRequested ? "ASTC extension unavailable; desktop fallback" : "desktop browser",
  };
}

function isMobileBrowser(): boolean {
  const userAgent = window.navigator.userAgent || "";
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(userAgent)) return true;

  const shortSide = Math.min(window.innerWidth || 1, window.innerHeight || 1);
  const hasTouch = (window.navigator.maxTouchPoints || 0) > 0;
  let coarsePointer = false;
  try {
    coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  } catch {
    // Older WebKit can rely on maxTouchPoints.
  }
  return shortSide <= 1024 && (coarsePointer || hasTouch);
}

export function browserSupportsAstc(): boolean {
  const canvas = document.createElement("canvas");
  const options: WebGLContextAttributes = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
  };
  let gl: WebGL2RenderingContext | null = null;
  try {
    // Unity's player uses WebGL2; a WebGL1-only result isn't sufficient.
    gl = canvas.getContext("webgl2", options);
    return gl?.getExtension(ASTC_EXTENSION) != null;
  } catch {
    return false;
  } finally {
    try { gl?.getExtension("WEBGL_lose_context")?.loseContext(); } catch { /* best effort */ }
    canvas.width = canvas.height = 1;
  }
}

type State =
  | { status: "loading"; version: null; error: null }
  | { status: "ready"; version: UnityBuildVersion; error: null }
  | { status: "error"; version: null; error: string };

export function useUnityBuildVersion(): State {
  const [state, setState] = useState<State>({
    status: "loading",
    version: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    // cache: "no-store" 是這整套機制的關鍵：這個檔案一旦被快取，
    // 玩家就會繼續被指向舊的 buildId，等於白做。
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    fetch("/Build/version.json", { cache: "no-store", signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`version.json responded ${res.status}`);
        return res.json() as Promise<UnityBuildVersionManifest>;
      })
      .then((manifest) => {
        if (cancelled) return;
        const isMobile = isMobileBrowser();
        const override = parseUnityBuildOverride(window.location.search);
        const needsProbe = manifest.variants != null && override !== "desktop"
          && (isMobile || override === "mobile-astc");
        const version = selectUnityBuildVersion(manifest, {
          isMobile,
          supportsAstc: needsProbe && browserSupportsAstc(),
          override,
        });
        setState({ status: "ready", version, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          version: null,
          error: err instanceof Error ? err.message : String(err),
        });
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return state;
}
