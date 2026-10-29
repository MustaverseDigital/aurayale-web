// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { brotliCompressSync, brotliDecompressSync, gzipSync } from "node:zlib";
import { afterEach, beforeEach, expect, test } from "vitest";
import { deployUnityBuild, deployUnityBuildVariants } from "../scripts/deploy-unity-build.mjs";
import { textureArchive } from "./unity-texture-fixture.mjs";

let root;
let source;
let publicBuild;
const wasm = Buffer.from([0, 97, 115, 109, 1, 0, 0, 0]);
const data = Buffer.from("UnityWebData1.0\0test archive");
const framework = Buffer.from("function unityFramework() { return {}; }");
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "aurayale-build-test-"));
  source = path.join(root, "UnityOutput");
  publicBuild = path.join(root, "public/Build");
  fs.mkdirSync(path.join(source, "Build"), { recursive: true });
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));
function fixture(ext = "", compress = (bytes) => bytes) {
  fs.writeFileSync(path.join(source, "Build/NewGame.loader.js"), "function createUnityInstance() {}");
  for (const [name, bytes] of [["wasm", wasm], ["data", data], ["framework.js", framework]]) {
    fs.writeFileSync(path.join(source, `Build/NewGame.${name}${ext}`), compress(bytes));
  }
}
function variantFixture(directory, metadata, marker) {
  fs.mkdirSync(path.join(directory, "Build"), { recursive: true });
  fs.writeFileSync(path.join(directory, "Build/Aurayale.loader.js"), `function createUnityInstance() { return ${JSON.stringify(marker)}; }`);
  fs.writeFileSync(path.join(directory, "Build/Aurayale.data"), textureArchive(metadata.textureCompression === "astc" ? 50 : 10));
  fs.writeFileSync(path.join(directory, "Build/Aurayale.framework.js"), framework);
  fs.writeFileSync(path.join(directory, "Build/Aurayale.wasm"), wasm);
  fs.writeFileSync(path.join(directory, "aurayale-build.json"), JSON.stringify({
    authMode: "website",
    exhibition: false,
    unityVersion: "6000.3.1f1",
    ...metadata,
  }));
}
for (const [name, ext, compress] of [["raw", "", (b) => b], ["gzip", ".gz", gzipSync], ["Brotli", ".br", brotliCompressSync], ["Brotli fallback", ".unityweb", brotliCompressSync], ["gzip fallback", ".unityweb", gzipSync]]) {
  test(`normalises ${name} Unity output to the exact Brotli serving contract`, () => {
    fixture(ext, compress);
    const { buildId } = deployUnityBuild(source, { publicBuild });
    for (const [kind, expected] of [["data", data], ["framework", framework], ["wasm", wasm]]) {
      expect(brotliDecompressSync(fs.readFileSync(path.join(publicBuild, buildId, `Build.${kind}.unityweb`)))).toEqual(expected);
    }
    expect(fs.existsSync(path.join(publicBuild, buildId, "Build.loader.js"))).toBe(true);
  });
}
test("versions StreamingAssets with the player and records account build metadata", () => {
  fixture();
  fs.mkdirSync(path.join(source, "StreamingAssets/config"), { recursive: true });
  fs.writeFileSync(path.join(source, "StreamingAssets/config/game.json"), '{"mode":"account"}');
  fs.writeFileSync(path.join(source, "aurayale-build.json"), JSON.stringify({ authMode: "website", exhibition: false, unityVersion: "6000.3.1f1" }));
  const { buildId } = deployUnityBuild(path.join(source, "Build"), { publicBuild });
  expect(fs.readFileSync(path.join(publicBuild, buildId, "StreamingAssets/config/game.json"), "utf8")).toBe('{"mode":"account"}');
  const manifest = JSON.parse(fs.readFileSync(path.join(publicBuild, buildId, "manifest.json"), "utf8"));
  expect(manifest.authMode).toBe("website");
  expect(manifest.exhibition).toBe(false);
  expect(manifest.files["Build.wasm.unityweb"].sha256).toMatch(/^[a-f0-9]{64}$/);
});
test("invalid or incomplete input cannot replace the currently published version", () => {
  fixture();
  const previous = deployUnityBuild(source, { publicBuild });
  fs.writeFileSync(path.join(source, "Build/NewGame.wasm"), "broken");
  expect(() => deployUnityBuild(source, { publicBuild })).toThrow("Invalid WebAssembly");
  expect(JSON.parse(fs.readFileSync(path.join(publicBuild, "version.json"), "utf8"))).toEqual(previous);
  expect(fs.readdirSync(publicBuild).some((file) => file.startsWith(".staging-"))).toBe(false);
});
test("refuses exhibition builds on the account-based site", () => {
  fixture();
  fs.writeFileSync(path.join(source, "aurayale-build.json"), '{"exhibition":true}');
  expect(() => deployUnityBuild(source, { publicBuild })).toThrow("exhibition player");
  expect(fs.existsSync(path.join(publicBuild, "version.json"))).toBe(false);
});

test("publishes an atomic desktop and mobile ASTC version manifest", () => {
  const variants = path.join(root, "Variants");
  variantFixture(path.join(variants, "Desktop"), {
    variant: "desktop",
    textureCompression: "dxt",
    maxTextureSize: 0,
  }, "desktop");
  variantFixture(path.join(variants, "MobileASTC"), {
    variant: "mobile-astc",
    textureCompression: "astc",
    maxTextureSize: 1024,
    convertedDxtOverrides: 315,
  }, "mobile-astc");

  const version = deployUnityBuildVariants(variants, { publicBuild });
  expect(version.buildId).toBe(version.variants.desktop.buildId);
  expect(version.variants.mobileAstc).toMatchObject({
    textureCompression: "astc",
    requiresExtension: "WEBGL_compressed_texture_astc",
    maxTextureSize: 1024,
  });
  expect(version.variants.mobileAstc.buildId).not.toBe(version.variants.desktop.buildId);
  for (const entry of Object.values(version.variants)) {
    expect(fs.existsSync(path.join(publicBuild, entry.buildId, "manifest.json"))).toBe(true);
  }
});

test("an invalid mobile variant cannot replace the selected version", () => {
  fixture();
  const previous = deployUnityBuild(source, { publicBuild });
  const variants = path.join(root, "Variants");
  variantFixture(path.join(variants, "Desktop"), {
    variant: "desktop",
    textureCompression: "dxt",
  }, "desktop");
  variantFixture(path.join(variants, "MobileASTC"), {
    variant: "mobile-astc",
    textureCompression: "dxt",
  }, "invalid-mobile");

  expect(() => deployUnityBuildVariants(variants, { publicBuild })).toThrow("Mobile texture audit failed");
  expect(JSON.parse(fs.readFileSync(path.join(publicBuild, "version.json"), "utf8"))).toEqual(previous);
});

test("cannot publish ASTC as the default player for all desktops", () => {
  const mobile = path.join(root, "MobileASTC");
  variantFixture(mobile, { variant: "mobile-astc", textureCompression: "astc" }, "mobile");
  expect(() => deployUnityBuild(mobile, { publicBuild })).toThrow("Desktop companion");
  expect(fs.existsSync(path.join(publicBuild, "version.json"))).toBe(false);
});
