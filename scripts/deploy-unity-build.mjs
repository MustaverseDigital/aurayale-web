#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { brotliCompressSync, brotliDecompressSync, gunzipSync, constants } from "node:zlib";
import { auditUnityTextures } from "./audit-unity-textures.mjs";

// Accept the complete Unity output directory or its nested Build directory.
// Normalise every supported Unity compression mode to the Brotli HTTP contract.
function brotliAsset(file, kind) {
  const source = fs.readFileSync(file);
  let decoded;
  let encoded;
  if (/\.(br|unityweb)$/.test(file)) {
    try {
      decoded = brotliDecompressSync(source);
      encoded = source;
    } catch (cause) {
      if (file.endsWith(".br")) throw cause;
      decoded = gunzipSync(source);
    }
  } else if (file.endsWith(".gz")) {
    decoded = gunzipSync(source);
  } else {
    decoded = source;
  }
  if (kind === "wasm" && !decoded.subarray(0, 8).equals(Buffer.from([0, 97, 115, 109, 1, 0, 0, 0]))) {
    throw new Error(`Invalid WebAssembly: ${file}`);
  }
  if (kind === "data" && !decoded.subarray(0, 16).toString().startsWith("UnityWebData1.0")) {
    throw new Error(`Invalid Unity data archive: ${file}`);
  }
  return encoded || brotliCompressSync(decoded, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } });
}

const BUILD_ID_PATTERN = /^\d{8}-\d{4}-[a-z0-9]+$/;

function inspectUnityBuild(source, { publicBuild, now }) {
  const root = path.resolve(source);
  const srcDir = fs.existsSync(path.join(root, "Build")) ? path.join(root, "Build") : root;
  const files = fs.readdirSync(srcDir);
  const loaders = files.filter((file) => file.endsWith(".loader.js"));
  if (loaders.length !== 1) throw new Error("Expected exactly one Unity .loader.js file");
  const stem = loaders[0].slice(0, -".loader.js".length);
  const assets = [[loaders[0], "Build.loader.js", "loader"]];
  for (const [kind, suffix] of [["data", "data"], ["framework", "framework.js"], ["wasm", "wasm"]]) {
    const candidates = files.filter((file) => ["", ".br", ".gz", ".unityweb"].some((ext) => file === `${stem}.${suffix}${ext}` || (kind === "framework" && file === `${stem}.framework${ext}`)));
    if (candidates.length !== 1) throw new Error(`Expected exactly one ${kind} artifact, got ${candidates.length}`);
    assets.push([candidates[0], `Build.${kind}.unityweb`, kind]);
  }

  // Validate all input before publishing anything or updating version.json.
  const payloads = assets.map(([from, to, kind]) => [to, kind === "loader" ? fs.readFileSync(path.join(srcDir, from)) : brotliAsset(path.join(srcDir, from), kind)]);
  const hash = createHash("sha256");
  payloads.forEach(([name, bytes]) => { hash.update(name); hash.update(bytes); });
  const outputRoot = path.dirname(srcDir);
  const streamingSource = path.join(outputRoot, "StreamingAssets");
  function hashTree(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symlinks are not supported: ${full}`);
      hash.update(path.relative(outputRoot, full));
      if (entry.isDirectory()) hashTree(full);
      else hash.update(fs.readFileSync(full));
    }
  }
  if (fs.existsSync(streamingSource)) hashTree(streamingSource);
  const metadataFile = path.join(outputRoot, "aurayale-build.json");
  const metadata = fs.existsSync(metadataFile) ? JSON.parse(fs.readFileSync(metadataFile, "utf8")) : {};
  if (metadata.exhibition === true) throw new Error("Cannot deploy an exhibition player to the account-based battle page");
  if (metadata.variant === "mobile-astc") {
    const data = payloads.find(([name]) => name === "Build.data.unityweb")[1];
    metadata.textureAudit = auditUnityTextures(brotliDecompressSync(data), { mobile: true });
  }
  // A desktop and ASTC build can occasionally have byte-identical code/framework
  // files. Keep their immutable directories distinct even in that edge case.
  hash.update(metadata.variant || "legacy");
  hash.update(metadata.textureCompression || "unknown");
  const stamp = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now).replace(/[-: ]/g, "");
  const buildId = `${stamp.slice(0, 8)}-${stamp.slice(8)}-${hash.digest("hex").slice(0, 12)}`;
  const destination = path.join(publicBuild, buildId);
  return { buildId, destination, metadata, outputRoot, payloads, streamingSource };
}

function materialiseUnityBuild(prepared, publicBuild) {
  const { buildId, destination, metadata, payloads, streamingSource } = prepared;
  const staging = path.join(publicBuild, `.staging-${process.pid}-${buildId}`);
  fs.mkdirSync(publicBuild, { recursive: true });
  try {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(staging);
      for (const [name, bytes] of payloads) fs.writeFileSync(path.join(staging, name), bytes);
      if (fs.existsSync(streamingSource)) fs.cpSync(streamingSource, path.join(staging, "StreamingAssets"), { recursive: true });
      fs.writeFileSync(path.join(staging, "manifest.json"), JSON.stringify({ ...metadata, buildId, compression: "brotli", files: Object.fromEntries(payloads.map(([name, bytes]) => [name, { bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") }])) }, null, 2) + "\n");
      fs.renameSync(staging, destination);
    }
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
}

function publishVersion(version, { publicBuild, keep, activeBuildIds }) {
  const versionTemp = path.join(publicBuild, `.version-${process.pid}.json`);
  fs.writeFileSync(versionTemp, JSON.stringify(version, null, 2) + "\n");
  fs.renameSync(versionTemp, path.join(publicBuild, "version.json"));

  const retainedBuildCount = keep * Math.max(1, activeBuildIds.size);
  const previous = fs.readdirSync(publicBuild, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && BUILD_ID_PATTERN.test(entry.name) && !activeBuildIds.has(entry.name))
    .map((entry) => entry.name)
    .sort()
    .reverse();
  for (const name of previous.slice(Math.max(0, retainedBuildCount - activeBuildIds.size)))
    fs.rmSync(path.join(publicBuild, name), { recursive: true });
}

function validateKeep(keep) {
  if (!Number.isInteger(keep) || keep < 1) throw new Error("--keep must be a positive integer");
}

export function deployUnityBuild(source, { publicBuild = path.resolve("public/Build"), keep = 3 } = {}) {
  validateKeep(keep);
  const now = new Date();
  const prepared = inspectUnityBuild(source, { publicBuild, now });
  if (prepared.metadata.variant === "mobile-astc")
    throw new Error("A mobile ASTC player must be published with its Desktop companion using the variant root");
  materialiseUnityBuild(prepared, publicBuild);
  const version = {
    buildId: prepared.buildId,
    builtAt: now.toISOString(),
    authMode: prepared.metadata.authMode || "website",
  };
  publishVersion(version, { publicBuild, keep, activeBuildIds: new Set([prepared.buildId]) });
  console.log(`Unity deployed to public/Build/${prepared.buildId}`);
  return version;
}

export function deployUnityBuildVariants(source, { publicBuild = path.resolve("public/Build"), keep = 3 } = {}) {
  validateKeep(keep);
  const root = path.resolve(source);
  const desktopSource = path.join(root, "Desktop");
  const mobileSource = path.join(root, "MobileASTC");
  if (!fs.existsSync(desktopSource) || !fs.existsSync(mobileSource))
    throw new Error("Variant build requires Desktop and MobileASTC output directories");

  const now = new Date();
  // Inspect both before publishing either one so an incomplete mobile player can
  // never replace the currently selected desktop/mobile pair.
  const desktop = inspectUnityBuild(desktopSource, { publicBuild, now });
  const mobileAstc = inspectUnityBuild(mobileSource, { publicBuild, now });
  if (desktop.metadata.variant !== "desktop" || desktop.metadata.textureCompression !== "dxt")
    throw new Error("Desktop build metadata must declare variant=desktop and textureCompression=dxt");
  if (mobileAstc.metadata.variant !== "mobile-astc" || mobileAstc.metadata.textureCompression !== "astc")
    throw new Error("Mobile build metadata must declare variant=mobile-astc and textureCompression=astc");

  materialiseUnityBuild(desktop, publicBuild);
  materialiseUnityBuild(mobileAstc, publicBuild);
  const version = {
    // Keep buildId for older clients; it always points at the desktop-safe player.
    buildId: desktop.buildId,
    builtAt: now.toISOString(),
    authMode: desktop.metadata.authMode || "website",
    variants: {
      desktop: {
        buildId: desktop.buildId,
        textureCompression: "dxt",
      },
      mobileAstc: {
        buildId: mobileAstc.buildId,
        textureCompression: "astc",
        requiresExtension: "WEBGL_compressed_texture_astc",
        maxTextureSize: mobileAstc.metadata.maxTextureSize,
      },
    },
  };
  const activeBuildIds = new Set([desktop.buildId, mobileAstc.buildId]);
  publishVersion(version, { publicBuild, keep, activeBuildIds });
  console.log(`Unity variants deployed: desktop=${desktop.buildId}, mobileAstc=${mobileAstc.buildId}`);
  return version;
}

/** Publish a mobile-only Unity fix while retaining the already verified desktop player. */
export function deployUnityMobileAstc(source, { publicBuild = path.resolve("public/Build"), keep = 3 } = {}) {
  validateKeep(keep);
  const versionPath = path.join(publicBuild, "version.json");
  if (!fs.existsSync(versionPath)) throw new Error("Mobile-only update requires an existing paired version manifest");
  const previous = JSON.parse(fs.readFileSync(versionPath, "utf8"));
  const desktop = previous.variants?.desktop;
  if (!desktop?.buildId || desktop.textureCompression !== "dxt"
    || previous.buildId !== desktop.buildId
    || !fs.existsSync(path.join(publicBuild, desktop.buildId, "manifest.json"))) {
    throw new Error("Mobile-only update requires an intact desktop companion");
  }

  const now = new Date();
  const mobile = inspectUnityBuild(source, { publicBuild, now });
  if (mobile.metadata.variant !== "mobile-astc" || mobile.metadata.textureCompression !== "astc")
    throw new Error("Mobile-only update requires variant=mobile-astc and textureCompression=astc");
  materialiseUnityBuild(mobile, publicBuild);
  const version = {
    ...previous,
    builtAt: now.toISOString(),
    variants: {
      ...previous.variants,
      mobileAstc: {
        buildId: mobile.buildId,
        textureCompression: "astc",
        requiresExtension: "WEBGL_compressed_texture_astc",
        maxTextureSize: mobile.metadata.maxTextureSize,
      },
    },
  };
  publishVersion(version, { publicBuild, keep, activeBuildIds: new Set([desktop.buildId, mobile.buildId]) });
  console.log(`Unity mobile ASTC updated: desktop=${desktop.buildId}, mobileAstc=${mobile.buildId}`);
  return version;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    const source = args[0];
    if (!source || source.startsWith("--")) throw new Error("Usage: node scripts/deploy-unity-build.mjs <Unity output or Build directory> [--keep N]");
    const mobileOnly = args.includes("--mobile-only");
    const keepIndex = args.indexOf("--keep");
    if (args.some((arg, index) => index > 0 && arg !== "--mobile-only" && arg !== "--keep" && index !== keepIndex + 1)
      || (keepIndex >= 0 && (keepIndex + 1 >= args.length || !/^\d+$/.test(args[keepIndex + 1])))
      || (mobileOnly && args.filter((arg) => arg === "--mobile-only").length !== 1))
      throw new Error("Usage: <source> [--mobile-only] [--keep N]");
    const options = { keep: keepIndex >= 0 ? Number(args[keepIndex + 1]) : 3 };
    const hasVariants = fs.existsSync(path.join(path.resolve(source), "Desktop"))
      && fs.existsSync(path.join(path.resolve(source), "MobileASTC"));
    if (mobileOnly) deployUnityMobileAstc(source, options);
    else if (hasVariants) deployUnityBuildVariants(source, options);
    else deployUnityBuild(source, options);
  } catch (cause) {
    console.error(cause instanceof Error ? cause.message : cause);
    process.exitCode = 1;
  }
}
