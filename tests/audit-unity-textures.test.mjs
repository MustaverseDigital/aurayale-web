// @vitest-environment node
import { expect, test } from "vitest";
import { auditUnityTextures } from "../scripts/audit-unity-textures.mjs";
import { textureArchive } from "./unity-texture-fixture.mjs";

test("accepts actual ASTC Texture2D headers", () => {
  expect(auditUnityTextures(textureArchive(), { mobile: true })).toMatchObject({ astcCount: 1, desktopOnlyCount: 0, oversizedCount: 0 });
});
test.each([10, 12, 24, 25, 26, 27, 28, 29])("rejects desktop texture format %s even when labeled mobile", format => {
  expect(() => auditUnityTextures(textureArchive(format), { mobile: true })).toThrow("Mobile texture audit failed");
});
test("rejects oversized ASTC textures", () => {
  expect(() => auditUnityTextures(textureArchive(50, 2048), { mobile: true })).toThrow("over1024=1");
});
test("rejects truncated data rather than assuming it passed", () => {
  expect(() => auditUnityTextures(textureArchive().subarray(0, 100), { mobile: true })).toThrow();
});
