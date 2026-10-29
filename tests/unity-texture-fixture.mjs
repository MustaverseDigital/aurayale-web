// Minimal Unity 6 release-format archive with one Texture2D. Independent of
// the parser, so malformed formats/headers exercise the publishing gate.
export function textureArchive(format = 50, width = 512) {
  const u32 = (n, be = false) => { const b = Buffer.alloc(4); be ? b.writeUInt32BE(n) : b.writeUInt32LE(n); return b; };
  const u64 = (n, be = false) => { const b = Buffer.alloc(8); be ? b.writeBigUInt64BE(BigInt(n)) : b.writeBigUInt64LE(BigInt(n)); return b; };
  const str = (s) => Buffer.from(s + "\0");
  const pad = (n, align) => Buffer.alloc((align - n % align) % align);
  const texture = Buffer.concat([u32(4), Buffer.from("Test"), u32(0), u32(width), u32(512), u32(16), u32(0), u32(format), u32(1)]);
  const typeInfo = Buffer.concat([str("6000.3.1f1"), u32(20), Buffer.from([0]), u32(1), u32(28), Buffer.alloc(19), u32(1)]);
  const objectInfo = Buffer.concat([u64(1), u64(0), u32(texture.length), u32(0)]);
  const metadata = Buffer.concat([typeInfo, pad(48 + typeInfo.length, 4), objectInfo]);
  const assetHeader = Buffer.alloc(48);
  assetHeader.writeUInt32BE(22, 8);
  assetHeader.writeBigUInt64BE(BigInt(48 + metadata.length), 32);
  const asset = Buffer.concat([assetHeader, metadata, texture]);
  const info = Buffer.concat([
    Buffer.alloc(16), u32(1, true), u32(asset.length, true), u32(asset.length, true), Buffer.alloc(2),
    u32(1, true), u64(0, true), u64(asset.length, true), u32(0, true), str("sharedassets0.assets"),
  ]);
  const prefix = Buffer.concat([str("UnityFS"), u32(8, true), str("6.x.x"), str("6000.3.1f1")]);
  const total = prefix.length + 20 + pad(prefix.length + 20, 16).length + info.length + asset.length;
  const bundle = Buffer.concat([prefix, u64(total, true), u32(info.length, true), u32(info.length, true), u32(0, true), pad(prefix.length + 20, 16), info, asset]);
  const name = Buffer.from("data.unity3d");
  const headerEnd = 20 + 12 + name.length;
  return Buffer.concat([Buffer.from("UnityWebData1.0\0"), u32(headerEnd), u32(headerEnd), u32(bundle.length), u32(name.length), name, bundle]);
}
