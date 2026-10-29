import { afterEach, describe, expect, test, vi } from "vitest";
import {
  parseUnityBuildOverride,
  browserSupportsAstc,
  selectUnityBuildVersion,
  type UnityBuildVersionManifest,
} from "../src/hooks/useUnityBuildVersion";

const manifest: UnityBuildVersionManifest = {
  buildId: "20261029-1200-desktop123",
  builtAt: "2026-10-29T04:00:00.000Z",
  variants: {
    desktop: {
      buildId: "20261029-1200-desktop123",
      textureCompression: "dxt",
    },
    mobileAstc: {
      buildId: "20261029-1200-mobileastc12",
      textureCompression: "astc",
      requiresExtension: "WEBGL_compressed_texture_astc",
      maxTextureSize: 1024,
    },
  },
};

describe("selectUnityBuildVersion", () => {
  test("selects ASTC only for a mobile browser that supports it", () => {
    expect(selectUnityBuildVersion(manifest, { isMobile: true, supportsAstc: true })).toMatchObject({
      buildId: manifest.variants?.mobileAstc.buildId,
      variant: "mobile-astc",
      textureCompression: "astc",
    });
  });

  test("falls back to the desktop-safe player when ASTC is unavailable", () => {
    expect(selectUnityBuildVersion(manifest, { isMobile: true, supportsAstc: false })).toMatchObject({
      buildId: manifest.variants?.desktop.buildId,
      variant: "desktop",
      selectionReason: "ASTC extension unavailable; desktop fallback",
    });
  });

  test("does not give an ASTC-capable desktop the downscaled mobile player", () => {
    expect(selectUnityBuildVersion(manifest, { isMobile: false, supportsAstc: true }).variant).toBe("desktop");
  });

  test("keeps legacy single-build manifests working", () => {
    expect(selectUnityBuildVersion(
      { buildId: "20261024-2323-e5f122b5c6fb" },
      { isMobile: true, supportsAstc: true },
    )).toMatchObject({ variant: "legacy", textureCompression: "unknown" });
  });

  test("a mobile override still requires hardware ASTC support", () => {
    expect(selectUnityBuildVersion(manifest, { isMobile: true, supportsAstc: false, override: "mobile-astc" }).variant).toBe("desktop");
    expect(selectUnityBuildVersion(manifest, { isMobile: true, supportsAstc: true, override: "desktop" }).variant).toBe("desktop");
  });

  test("rejects invalid variant declarations before mounting a player", () => {
    expect(() => selectUnityBuildVersion({ ...manifest, variants: {
      ...manifest.variants!, mobileAstc: { buildId: "../../wrong", textureCompression: "astc" },
    } }, { isMobile: true, supportsAstc: true })).toThrow("invalid mobile ASTC buildId");
  });
});

describe("browserSupportsAstc", () => {
  afterEach(() => vi.restoreAllMocks());
  test("releases the probe context after detecting ASTC", () => {
    const loseContext = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      getExtension: (name: string) => name === "WEBGL_compressed_texture_astc" ? {} : { loseContext },
    } as unknown as WebGL2RenderingContext);
    expect(browserSupportsAstc()).toBe(true);
    expect(loseContext).toHaveBeenCalledOnce();
  });
  test("a browser that throws while creating a context falls back", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => { throw new Error("context unavailable"); });
    expect(browserSupportsAstc()).toBe(false);
  });
});

describe("parseUnityBuildOverride", () => {
  test.each([
    ["?unityBuild=desktop", "desktop"],
    ["?unityBuild=mobile-astc", "mobile-astc"],
    ["?unityBuild=other", null],
    ["", null],
  ])("parses %s", (search, expected) => {
    expect(parseUnityBuildOverride(search)).toBe(expected);
  });
});
