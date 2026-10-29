// Unity 6000.3 release-player artifact audit. Inspect the actual Texture2D
// headers, not importer settings (BuildPlayer can override those settings).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { brotliDecompressSync } from "node:zlib";

class Reader {
  constructor(bytes, offset = 0) { this.bytes = bytes; this.offset = offset; }
  take(size) {
    if (!Number.isSafeInteger(size) || size < 0 || this.offset + size > this.bytes.length)
      throw new Error("Truncated or invalid Unity archive");
    const value = this.bytes.subarray(this.offset, this.offset + size);
    this.offset += size;
    return value;
  }
  u32(be = false) { return be ? this.take(4).readUInt32BE() : this.take(4).readUInt32LE(); }
  u64(be = false) {
    const b = this.take(8);
    const n = Number(be ? b.readBigUInt64BE() : b.readBigUInt64LE());
    if (!Number.isSafeInteger(n)) throw new Error("Unity offset exceeds safe integer range");
    return n;
  }
  cstring() {
    const end = this.bytes.indexOf(0, this.offset);
    if (end < 0) throw new Error("Unterminated Unity string");
    const text = this.take(end - this.offset).toString();
    this.take(1);
    return text;
  }
  align(n) { this.take((n - this.offset % n) % n); }
}

function unpackBlock(bytes, size, compression) {
  if (size > 512 * 1024 * 1024) throw new Error("Unity block exceeds audit size limit");
  if (compression === 0) {
    if (bytes.length !== size) throw new Error("Invalid raw Unity block size");
    return bytes;
  }
  if (compression !== 2 && compression !== 3) throw new Error(`Unsupported UnityFS compression: ${compression}`);
  const out = Buffer.alloc(size);
  const r = new Reader(bytes);
  let pos = 0;
  const length = (base) => {
    let result = base;
    if (base === 15) {
      let extra;
      do { extra = r.take(1)[0]; result += extra; } while (extra === 255);
    }
    return result;
  };
  while (r.offset < bytes.length) {
    const token = r.take(1)[0];
    const literals = length(token >> 4);
    if (pos + literals > size) throw new Error("LZ4 literal overflow");
    r.take(literals).copy(out, pos);
    pos += literals;
    if (r.offset === bytes.length) break;
    const distance = r.take(2).readUInt16LE();
    const count = length(token & 15) + 4;
    if (distance === 0 || distance > pos || pos + count > size) throw new Error("Invalid LZ4 match");
    for (let i = 0; i < count; i++) { out[pos] = out[pos - distance]; pos++; }
  }
  if (pos !== size) throw new Error("LZ4 output size mismatch");
  return out;
}

function unpackUnityFs(bytes) {
  const r = new Reader(bytes);
  if (r.cstring() !== "UnityFS") throw new Error("Expected UnityFS archive");
  const version = r.u32(true);
  if (version !== 8) throw new Error(`Unsupported UnityFS version: ${version}`);
  r.cstring(); r.cstring();
  const total = r.u64(true);
  const packedSize = r.u32(true), infoSize = r.u32(true), flags = r.u32(true);
  if (total !== bytes.length) throw new Error("UnityFS size mismatch");
  r.align(16);
  const infoBytes = flags & 0x80 ? bytes.subarray(bytes.length - packedSize) : r.take(packedSize);
  const info = new Reader(unpackBlock(infoBytes, infoSize, flags & 63));
  if (flags & 0x200) r.align(16);
  info.take(16);
  const blocks = [];
  for (let n = info.u32(true); n > 0; n--)
    blocks.push({ size: info.u32(true), packed: info.u32(true), flags: info.take(2).readUInt16BE() });
  const nodes = [];
  for (let n = info.u32(true); n > 0; n--)
    nodes.push({ offset: info.u64(true), size: info.u64(true), flags: info.u32(true), name: info.cstring() });
  const body = Buffer.concat(blocks.map(b => unpackBlock(r.take(b.packed), b.size, b.flags & 63)));
  return { body, nodes };
}

function texturesInAsset(bytes, asset) {
  const header = new Reader(bytes, 8);
  if (header.u32(true) !== 22) throw new Error(`Unsupported serialized asset version: ${asset}`);
  header.offset = 32;
  const dataOffset = header.u64(true);
  const r = new Reader(bytes, 48);
  const unityVersion = r.cstring();
  if (!unityVersion.startsWith("6000.3.")) throw new Error(`Unsupported texture schema: ${unityVersion}`);
  r.take(4);
  if (r.take(1)[0]) throw new Error(`Type trees are unsupported in release audit: ${asset}`);
  const types = [];
  for (let n = r.u32(); n > 0; n--) {
    const id = r.take(4).readInt32LE();
    r.take(3);
    if (id < 0 || id === 114) r.take(16);
    r.take(16);
    types.push(id);
  }
  const textures = [];
  for (let n = r.u32(); n > 0; n--) {
    r.align(4);
    r.take(8);
    const offset = r.u64(), size = r.u32(), type = r.u32();
    if (types[type] !== 28) continue;
    if (dataOffset + offset + size > bytes.length) throw new Error("Texture object exceeds asset bounds");
    const t = new Reader(bytes.subarray(dataOffset + offset, dataOffset + offset + size));
    const name = t.take(t.u32()).toString();
    t.align(4); t.take(4);
    const width = t.u32(), height = t.u32(), imageBytes = t.u32();
    t.take(4);
    const format = t.u32(), mips = t.u32();
    if (width > 16384 || height > 16384 || format > 255) throw new Error(`Invalid Texture2D header: ${name}`);
    textures.push({ asset, name, width, height, imageBytes, format, mips });
  }
  return textures;
}

export function auditUnityTextures(decodedData, { mobile = false } = {}) {
  if (!decodedData.subarray(0, 16).toString().startsWith("UnityWebData1.0")) throw new Error("Expected UnityWebData1.0");
  const r = new Reader(decodedData, 16);
  const headerEnd = r.u32();
  let inner;
  while (r.offset < headerEnd) {
    const offset = r.u32(), size = r.u32(), name = r.take(r.u32()).toString();
    if (offset + size > decodedData.length) throw new Error("WebData entry exceeds archive bounds");
    if (name === "data.unity3d") inner = decodedData.subarray(offset, offset + size);
  }
  if (!inner) throw new Error("Unity data.unity3d missing");
  const { body, nodes } = unpackUnityFs(inner);
  const textures = nodes.filter(n => n.name.endsWith(".assets")).flatMap(n =>
    texturesInAsset(body.subarray(n.offset, n.offset + n.size), n.name));
  if (textures.length === 0) throw new Error("No Texture2D objects found in player");
  const formats = {};
  for (const t of textures) formats[t.format] = (formats[t.format] || 0) + 1;
  const astc = textures.filter(t => t.format >= 48 && t.format <= 53);
  const desktopOnly = textures.filter(t => [10, 12, 24, 25, 26, 27, 28, 29].includes(t.format));
  const oversized = textures.filter(t => t.width > 1024 || t.height > 1024);
  if (mobile && (astc.length === 0 || desktopOnly.length > 0 || oversized.length > 0))
    throw new Error(`Mobile texture audit failed: ASTC=${astc.length}, desktop-only=${desktopOnly.length}, over1024=${oversized.length}; ${desktopOnly.concat(oversized).slice(0, 8).map(t => t.name).join(", ")}`);
  return {
    schema: "unity-6000.3-texture2d-v1",
    textureCount: textures.length,
    astcCount: astc.length,
    desktopOnlyCount: desktopOnly.length,
    oversizedCount: oversized.length,
    serializedImageBytes: textures.reduce((sum, t) => sum + t.imageBytes, 0),
    unityFsBytes: body.length,
    formats,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const file = process.argv[2];
    if (!file) throw new Error("Usage: audit-unity-textures.mjs <data.unityweb> [--mobile]");
    const decoded = brotliDecompressSync(fs.readFileSync(file));
    console.log(JSON.stringify(auditUnityTextures(decoded, { mobile: process.argv.includes("--mobile") }), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
