// @vitest-environment node
import fs from "node:fs";
import vm from "node:vm";
import { createHash, webcrypto } from "node:crypto";
import { beforeEach, expect, test } from "vitest";

const origin = "https://demo.example";
const id = "20261112-1200-abcdef123456";
let listeners, stores, online, broken, version, files;
const key = value => typeof value === "string" ? new URL(value, origin).href : value.url || value.href;
const digest = value => createHash("sha256").update(value).digest("hex");

beforeEach(() => {
  listeners = {}; stores = new Map(); online = true; broken = "";
  version = { buildId: id, exhibition: true, authMode: "local", variants: { desktop: { buildId: id } } };
  files = new Map(["Build.loader.js", "Build.data.unityweb", "Build.framework.unityweb", "Build.wasm.unityweb"].map(name => [name, Buffer.from(name)]));
  const context = {
    URL, Response, Request, AbortController, setTimeout, clearTimeout, crypto: webcrypto,
    self: { location: { origin }, addEventListener: (event, fn) => { listeners[event] = fn; }, skipWaiting: async () => {}, clients: { claim: async () => {} } },
    caches: {
      keys: async () => [...stores.keys()], delete: async name => stores.delete(name),
      open: async name => {
        if (!stores.has(name)) stores.set(name, new Map());
        const entries = stores.get(name);
        return { match: async url => entries.get(key(url))?.clone(), put: async (url, response) => { entries.set(key(url), response.clone()); } };
      },
    },
    fetch: async url => {
      if (!online) throw new Error("Network offline");
      const path = new URL(key(url)).pathname;
      if (path === "/ExhibitionBuild/version.json") return Response.json(version);
      if (path.endsWith("offline-assets.json")) return Response.json({ buildId: id, assets: [...files].map(([path, bytes]) => ({ path, bytes: bytes.length, sha256: digest(bytes) })) });
      if (path === "/exhibition") return new Response('<html><script src="/_next/static/exhibition.js"></script><script>{"page":"/exhibition","buildId":"web-release-1"}</script></html>');
      for (const [name, bytes] of files) if (path.endsWith(name)) return new Response(broken === name ? "corrupt" : bytes);
      return new Response("shell asset");
    },
  };
  vm.runInNewContext(fs.readFileSync(new URL("../public/exhibition/sw.js", import.meta.url), "utf8"), context);
});

async function message(type) {
  let result;
  let task;
  listeners.message({ data: { type, variant: "desktop" }, ports: [{ postMessage: value => { if (value.type !== "progress") result = value; } }], waitUntil: promise => { task = promise; } });
  await task;
  return result;
}
async function fetchThroughWorker(path, options) {
  let result;
  listeners.fetch({ request: new Request(origin + path, options), respondWith: promise => { result = promise; } });
  return result;
}

test("a prepared package reopens the page, scripts, player, and version manifest fully offline", async () => {
  expect((await message("STATUS")).result.ready).toBe(false);
  expect((await message("PREPARE")).result).toMatchObject({ ready: true, buildId: id });
  online = false;
  expect(await (await fetchThroughWorker("/exhibition")).text()).toContain("web-release-1");
  expect(await (await fetchThroughWorker("/_next/static/exhibition.js")).text()).toBe("shell asset");
  for (const [name, bytes] of files) expect(Buffer.from(await (await fetchThroughWorker(`/ExhibitionBuild/${id}/${name}`)).arrayBuffer())).toEqual(bytes);
  expect(await (await fetchThroughWorker("/ExhibitionBuild/version.json")).json()).toEqual(version);
  expect((await message("STATUS")).result.ready).toBe(true);
  expect(await fetchThroughWorker("/battle")).toBeUndefined();
  expect(await fetchThroughWorker("/api/user/profile")).toBeUndefined();
});

test("a corrupted update leaves the complete prior package playable", async () => {
  const original = (await message("PREPARE")).result;
  broken = "Build.wasm.unityweb";
  expect((await message("PREPARE")).error).toContain("integrity");
  expect((await message("STATUS")).result.cache).toBe(original.cache);
  online = false;
  expect(await (await fetchThroughWorker(`/ExhibitionBuild/${id}/Build.wasm.unityweb`)).text()).toBe("Build.wasm.unityweb");
});

test("account manifests and incomplete players cannot be marked offline ready", async () => {
  version.exhibition = false;
  expect((await message("PREPARE")).error).toContain("manifest");
  expect((await message("STATUS")).result.ready).toBe(false);
  version.exhibition = true;
  files.delete("Build.wasm.unityweb"); files.set("other", Buffer.from("other"));
  expect((await message("PREPARE")).error).toContain("Missing required");
  expect((await message("STATUS")).result.ready).toBe(false);
});

test("evicted package assets are reported as unavailable", async () => {
  const selected = (await message("PREPARE")).result;
  stores.get(selected.cache).delete(`${origin}/ExhibitionBuild/${id}/Build.wasm.unityweb`);
  expect((await message("STATUS")).result.ready).toBe(false);
});
