import { describe, expect, test } from "vitest";
import {
  MOBILE_UNITY_DPR_CAP,
  MOBILE_UNITY_PIXEL_BUDGET,
  calculateUnityDpr,
  parseUnityDprOverride,
} from "../src/hooks/useUnityDevicePixelRatio";

describe("calculateUnityDpr", () => {
  test("keeps the native DPR on desktop", () => {
    const result = calculateUnityDpr({
      rawDevicePixelRatio: 2,
      isMobileViewport: false,
      cssWidth: 900,
      cssHeight: 800,
    });

    expect(result.effectiveDevicePixelRatio).toBe(2);
    expect(result.renderWidth).toBe(1800);
    expect(result.renderHeight).toBe(1600);
  });

  test("caps an iPhone 12-sized viewport at DPR 2 within the mobile pixel budget", () => {
    const result = calculateUnityDpr({
      rawDevicePixelRatio: 3,
      isMobileViewport: true,
      cssWidth: 390,
      cssHeight: 844,
    });

    expect(result.effectiveDevicePixelRatio).toBe(MOBILE_UNITY_DPR_CAP);
    expect(result.renderWidth).toBe(780);
    expect(result.renderHeight).toBe(1688);
    expect(result.renderPixels).toBe(1_316_640);
  });

  test("reduces larger mobile viewports to the pixel budget", () => {
    const result = calculateUnityDpr({
      rawDevicePixelRatio: 2,
      isMobileViewport: true,
      cssWidth: 820,
      cssHeight: 1180,
    });

    expect(result.effectiveDevicePixelRatio).toBeLessThan(MOBILE_UNITY_DPR_CAP);
    expect(result.renderPixels).toBeLessThanOrEqual(MOBILE_UNITY_PIXEL_BUDGET);
  });

  test("uses an explicit diagnostic override for A/B testing", () => {
    const result = calculateUnityDpr({
      rawDevicePixelRatio: 3,
      isMobileViewport: true,
      cssWidth: 390,
      cssHeight: 844,
      overrideDevicePixelRatio: 1,
    });

    expect(result.effectiveDevicePixelRatio).toBe(1);
    expect(result.overrideDevicePixelRatio).toBe(1);
  });
});

describe("parseUnityDprOverride", () => {
  test.each([
    ["?unityDpr=1", 1],
    ["?foo=bar&unityDpr=1.5", 1.5],
    ["?unityDpr=2", 2],
    ["?unityDpr=0.75", 0.75],
  ])("parses %s", (search, expected) => {
    expect(parseUnityDprOverride(search)).toBe(expected);
  });

  test.each(["", "?unityDpr=", "?unityDpr=abc", "?unityDpr=0.5", "?unityDpr=4"])(
    "rejects an invalid override: %s",
    (search) => expect(parseUnityDprOverride(search)).toBeNull(),
  );
});
