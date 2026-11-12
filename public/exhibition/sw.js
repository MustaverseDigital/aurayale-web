/* The worker controls exhibition navigation only; it never caches account/API responses. */
const META = "aurayale-exhibition-meta-v1";
const ACTIVE = new URL("/exhibition/__active", self.location.origin).href;
const ROOT = self.location.origin;
let preparing = false;
const pagePath = (url) => url.pathname === "/exhibition" || url.pathname === "/exhibition/";
const allowed = (url) => url.origin === ROOT && (pagePath(url)
  || url.pathname.startsWith("/ExhibitionBuild/") || url.pathname.startsWith("/_next/static/")
  || ["/img/Aurayale_Bg.jpg", "/img/logo.png", "/img/rune-magic-texture.png", "/favicon.ico", "/favicon-32x32.png", "/favicon-16x16.png", "/favicon-192x192.png", "/favicon-512x512.png", "/apple-touch-icon.png", "/site.webmanifest"].includes(url.pathname));

async function active() {
  const response = await (await caches.open(META)).match(ACTIVE);
  return response ? response.json() : null;
}
self.addEventListener("install", (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || !allowed(url) || event.request.cache === "reload") return;
  event.respondWith((async () => {
    const selected = await active();
    if (selected) {
      const cache = await caches.open(selected.cache);
      const key = pagePath(url) ? new URL("/exhibition", ROOT).href : event.request;
      const hit = await cache.match(key);
      if (hit) return hit;
    }
    // Immutable URLs can belong to a still-open tab on the previous package.
    if (!pagePath(url) && url.pathname !== "/ExhibitionBuild/version.json") {
      for (const name of await caches.keys()) {
        if (!name.startsWith("aurayale-exhibition-package-")) continue;
        const hit = await (await caches.open(name)).match(event.request);
        if (hit) return hit;
      }
    }
    return fetch(event.request);
  })());
});

async function download(url, signal) {
  const response = await fetch(url, { cache: "reload", signal, credentials: "omit" });
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${new URL(url, ROOT).pathname}`);
  return response;
}
async function prepare(variant, port) {
  if (preparing) throw new Error("An offline download is already running");
  preparing = true;
  let name;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15 * 60 * 1000);
  try {
    const versionResponse = await download("/ExhibitionBuild/version.json", controller.signal);
    const manifest = await versionResponse.clone().json();
    if (manifest.exhibition !== true || manifest.authMode !== "local") throw new Error("Invalid exhibition manifest");
    const entry = variant === "mobile-astc" ? manifest.variants?.mobileAstc : manifest.variants?.desktop;
    if (!entry || !/^\d{8}-\d{4}-[a-z0-9]+$/.test(entry.buildId)) throw new Error("Invalid exhibition build");
    const base = `/ExhibitionBuild/${entry.buildId}/`;
    const inventoryResponse = await download(base + "offline-assets.json", controller.signal);
    const inventory = await inventoryResponse.clone().json();
    if (inventory.buildId !== entry.buildId || !Array.isArray(inventory.assets) || inventory.assets.length < 4)
      throw new Error("Incomplete exhibition assets");
    for (const required of ["Build.loader.js", "Build.data.unityweb", "Build.framework.unityweb", "Build.wasm.unityweb"])
      if (!inventory.assets.some(asset => asset.path === required)) throw new Error("Missing required player asset: " + required);
    const htmlResponse = await download("/exhibition", controller.signal);
    const html = await htmlResponse.clone().text();
    if (!html.includes('"page":"/exhibition"') || html.includes('"buildId":"development"'))
      throw new Error("Prepare offline mode from a production build");
    name = `aurayale-exhibition-package-${entry.buildId}-${Date.now()}`;
    const cache = await caches.open(name);
    const resources = new Map();
    for (const asset of inventory.assets) {
      if (typeof asset.path !== "string" || asset.path.includes("..") || asset.path.startsWith("/")
        || !/^[a-f0-9]{64}$/.test(asset.sha256) || !Number.isSafeInteger(asset.bytes)) throw new Error("Invalid asset inventory");
      const url = new URL(base + asset.path, ROOT);
      if (!url.pathname.startsWith(base) || url.origin !== ROOT) throw new Error("Invalid asset path");
      resources.set(url.href, asset);
    }
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const url = new URL(match[1].replaceAll("&amp;", "&"), ROOT);
      if (url.origin === ROOT && url.pathname.startsWith("/_next/static/")) resources.set(url.href, null);
    }
    for (const path of ["/img/Aurayale_Bg.jpg", "/img/logo.png", "/img/rune-magic-texture.png", "/favicon.ico", "/favicon-32x32.png", "/favicon-16x16.png", "/favicon-192x192.png", "/favicon-512x512.png", "/apple-touch-icon.png", "/site.webmanifest"])
      resources.set(new URL(path, ROOT).href, null);
    let done = 0;
    for (const [url, asset] of resources) {
      port.postMessage({ type: "progress", done, total: resources.size });
      const response = await download(url, controller.signal);
      if (asset) {
        const bytes = await response.clone().arrayBuffer();
        const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), b => b.toString(16).padStart(2, "0")).join("");
        if (bytes.byteLength !== asset.bytes || digest !== asset.sha256) throw new Error("Asset integrity check failed: " + asset.path);
      } else if (new URL(url).pathname.endsWith(".css")) {
        const css = await response.clone().text();
        for (const match of css.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)) {
          const font = new URL(match[1], url);
          if (font.origin === ROOT && font.pathname.startsWith("/_next/static/") && /\.(woff2?|ttf|otf)$/.test(font.pathname)) resources.set(font.href, null);
        }
      }
      await cache.put(url, response);
      port.postMessage({ type: "progress", done: ++done, total: resources.size });
    }
    await cache.put(new URL("/exhibition", ROOT), htmlResponse);
    await cache.put(new URL("/ExhibitionBuild/version.json", ROOT), versionResponse);
    await cache.put(new URL(base + "offline-assets.json", ROOT), inventoryResponse);
    const selected = { ready: true, buildId: entry.buildId, cache: name, required: [...resources.keys()] };
    await (await caches.open(META)).put(ACTIVE, new Response(JSON.stringify(selected)));
    // Existing packages remain available to tabs using the previous release.
    return selected;
  } catch (error) {
    if (name) await caches.delete(name);
    throw error;
  } finally { clearTimeout(timeout); preparing = false; }
}
self.addEventListener("message", (event) => {
  const port = event.ports[0];
  if (!port) return;
  event.waitUntil((async () => {
    try {
      let result;
      if (event.data.type === "STATUS") {
        result = await active() || { ready: false };
        if (result.ready) {
          const selected = result;
          const cache = await caches.open(selected.cache);
          for (const url of result.required || []) {
            if (!await cache.match(url)) { result = { ready: false }; break; }
          }
          const inventory = await cache.match(new URL(`/ExhibitionBuild/${selected.buildId}/offline-assets.json`, ROOT));
          const shell = await cache.match(new URL("/exhibition", ROOT));
          if (!inventory || !shell) result = { ready: false };
          else {
            for (const asset of (await inventory.json()).assets) {
              if (!await cache.match(new URL(`/ExhibitionBuild/${selected.buildId}/${asset.path}`, ROOT))) { result = { ready: false }; break; }
            }
          }
        }
      }
      else if (event.data.type === "PREPARE") result = await prepare(event.data.variant, port);
      else throw new Error("Unknown offline command");
      port.postMessage({ result });
    } catch (error) { port.postMessage({ error: error.message || "Offline preparation failed" }); }
  })());
});
