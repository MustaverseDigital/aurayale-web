#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { brotliCompressSync, brotliDecompressSync, gunzipSync, constants } from "node:zlib";

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

export function deployUnityBuild(source, { publicBuild = path.resolve("public/Build"), keep = 3 } = {}) {
  if (!Number.isInteger(keep) || keep < 1) throw new Error("--keep must be a positive integer");
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
  const now = new Date();
  const stamp = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now).replace(/[-: ]/g, "");
  const buildId = `${stamp.slice(0, 8)}-${stamp.slice(8)}-${hash.digest("hex").slice(0, 12)}`;
  const destination = path.join(publicBuild, buildId);
  const staging = path.join(publicBuild, `.staging-${process.pid}`);
  fs.mkdirSync(publicBuild, { recursive: true });
  try {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(staging);
      for (const [name, bytes] of payloads) fs.writeFileSync(path.join(staging, name), bytes);
      if (fs.existsSync(streamingSource)) fs.cpSync(streamingSource, path.join(staging, "StreamingAssets"), { recursive: true });
      fs.writeFileSync(path.join(staging, "manifest.json"), JSON.stringify({ ...metadata, buildId, compression: "brotli", files: Object.fromEntries(payloads.map(([name, bytes]) => [name, { bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") }])) }, null, 2) + "\n");
      fs.renameSync(staging, destination);
    }
    const version = { buildId, builtAt: now.toISOString(), authMode: metadata.authMode || "website" };
    const versionTemp = path.join(publicBuild, `.version-${process.pid}.json`);
    fs.writeFileSync(versionTemp, JSON.stringify(version, null, 2) + "\n");
    fs.renameSync(versionTemp, path.join(publicBuild, "version.json"));
    const previous = fs.readdirSync(publicBuild, { withFileTypes: true }).filter((e) => e.isDirectory() && /^\d{8}-\d{4}-[a-z0-9]+$/.test(e.name) && e.name !== buildId).map((e) => e.name).sort().reverse();
    for (const name of previous.slice(keep - 1)) fs.rmSync(path.join(publicBuild, name), { recursive: true });
    console.log(`Unity deployed to public/Build/${buildId}`);
    return version;
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    const source = args[0];
    if (!source || source.startsWith("--")) throw new Error("Usage: node scripts/deploy-unity-build.mjs <Unity output or Build directory> [--keep N]");
    if (args.length > 1 && (args[1] !== "--keep" || args.length !== 3)) throw new Error("Usage: <source> [--keep N]");
    deployUnityBuild(source, { keep: args[1] === "--keep" ? Number(args[2]) : 3 });
  } catch (cause) {
    console.error(cause instanceof Error ? cause.message : cause);
    process.exitCode = 1;
  }
}
