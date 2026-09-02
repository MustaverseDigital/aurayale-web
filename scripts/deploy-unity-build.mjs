#!/usr/bin/env node
/**
 * 把 Unity WebGL build 產物搬進 public/Build/<buildId>/，並寫出 version.json。
 *
 * 為什麼要帶版本目錄：四個檔案（loader / data / framework / wasm）是四個獨立的
 * 快取項目，檔名固定時各自的過期時間不同 —— 玩家可能拿到新 loader + 舊 wasm，
 * 版本錯配就會在 90% 炸成 "Maximum call stack size exceeded"。
 * 換成每次 build 一個新目錄後，四個檔案要嘛全新、要嘛全舊，不可能混搭。
 *
 * 用法：
 *   node scripts/deploy-unity-build.mjs <unity-build-output-dir> [--keep 3]
 *
 * <unity-build-output-dir> 是 Unity 吐出來的那個 Build/ 資料夾，裡面應有：
 *   Build.loader.js / Build.data.unityweb（或 .data）/ Build.framework.js.unityweb / Build.wasm.unityweb
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PUBLIC_BUILD = path.join(process.cwd(), "public", "Build");

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

// --- 參數 -----------------------------------------------------------------
const args = process.argv.slice(2);
const srcDir = args.find((a) => !a.startsWith("--"));
if (!srcDir) fail("請指定 Unity build 輸出目錄：node scripts/deploy-unity-build.mjs <dir>");
if (!fs.existsSync(srcDir)) fail(`找不到目錄：${srcDir}`);

const keepIdx = args.indexOf("--keep");
const keep = keepIdx !== -1 ? Number(args[keepIdx + 1]) : 3;
if (!Number.isInteger(keep) || keep < 1) fail("--keep 需為 >= 1 的整數");

// --- 找出四個產物 ---------------------------------------------------------
// Unity 依 compressionFormat / decompressionFallback 會產生不同副檔名，
// 這裡用前綴比對，不寫死尾巴。
const srcFiles = fs.readdirSync(srcDir);
const pick = (re, label) => {
  const hit = srcFiles.filter((f) => re.test(f));
  if (hit.length === 0) fail(`在 ${srcDir} 找不到 ${label}（比對 ${re}）`);
  if (hit.length > 1) fail(`${label} 找到多個，無法判斷要用哪個：${hit.join(", ")}`);
  return hit[0];
};

const loader = pick(/^Build\.loader\.js$/, "loader");
const data = pick(/^Build\.data(\.|$)/, "data");
const framework = pick(/^Build\.framework(\.|$)/, "framework");
const wasm = pick(/^Build\.wasm(\.|$)/, "wasm");

// --- buildId：git sha + 時間，可讀又唯一 ----------------------------------
let sha = "nogit";
try {
  sha = execFileSync("git", ["rev-parse", "--short=7", "HEAD"], { encoding: "utf8" }).trim();
} catch {
  /* 不在 git repo 也能跑 */
}
const now = new Date();
const p2 = (n) => String(n).padStart(2, "0");
const stamp =
  `${now.getFullYear()}${p2(now.getMonth() + 1)}${p2(now.getDate())}` +
  `-${p2(now.getHours())}${p2(now.getMinutes())}`;
const buildId = `${stamp}-${sha}`;

const destDir = path.join(PUBLIC_BUILD, buildId);
if (fs.existsSync(destDir)) fail(`${destDir} 已存在，請先刪除或等一分鐘再跑`);
fs.mkdirSync(destDir, { recursive: true });

// --- 複製並正規化檔名 -----------------------------------------------------
// framework / wasm / data 一律落地為 .unityweb：
// Vercel CDN 會依副檔名推導 Content-Type，含 .js 會被判為 javascript、
// .wasm 會被判為 application/wasm —— 兩者都在 CDN 自動壓縮的 MIME 清單內，
// 會在我們已經是 Brotli 的內容上再壓一層，瀏覽器解一層後仍是壓縮資料。
// .unityweb 不在清單內，Vercel 原樣送出。
const copies = [
  [loader, "Build.loader.js"],
  [data, "Build.data.unityweb"],
  [framework, "Build.framework.unityweb"],
  [wasm, "Build.wasm.unityweb"],
];

for (const [from, to] of copies) {
  fs.copyFileSync(path.join(srcDir, from), path.join(destDir, to));
  const mb = (fs.statSync(path.join(destDir, to)).size / 1024 / 1024).toFixed(1);
  console.log(`  ${from}  →  ${buildId}/${to}  (${mb} MB)`);
}

// --- version.json：唯一一個 no-store 的檔案 -------------------------------
fs.writeFileSync(
  path.join(PUBLIC_BUILD, "version.json"),
  JSON.stringify({ buildId, builtAt: now.toISOString() }, null, 2) + "\n",
);

// --- 清掉過舊的版本目錄（保留最近 N 個，含這次） --------------------------
const versionDirs = fs
  .readdirSync(PUBLIC_BUILD, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^\d{8}-\d{4}-/.test(e.name))
  .map((e) => e.name)
  .sort();

const stale = versionDirs.slice(0, Math.max(0, versionDirs.length - keep));
for (const dir of stale) {
  fs.rmSync(path.join(PUBLIC_BUILD, dir), { recursive: true, force: true });
  console.log(`  🗑  移除舊版本 ${dir}`);
}

console.log(`\n✓ buildId = ${buildId}`);
console.log(`  下一步：git add public/Build && git commit && push\n`);
