# Unity WebGL → /battle

Requirements: Unity **6000.3.1f1** with WebGL Build Support, Node >=20 (22 recommended), pnpm 9.15.4. Keep the two repositories as sibling directories and close the Unity Editor before running a batch build.

```sh
corepack pnpm install --frozen-lockfile
cp .env.example .env.local
# Set NEXT_PUBLIC_PRIVY_APP_ID to the existing production Privy app ID.
corepack pnpm build:unity
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
corepack pnpm start
```

`build:unity` invokes `Aurayale.Editor.WebGLBuild.BuildVariants` in `../gemfi-gaming`, logs to `gemfi-gaming/Logs/aurayale-webgl-build.log`, then imports Desktop and MobileASTC into separate immutable `public/Build/<buildId>/` directories. Supply a different Unity project as its first argument; set `UNITY_EDITOR_PATH` to override the editor executable.

The build starts with Title and includes InGameTutorial, InGame, and OutGame. It rejects `EXHIBITION_BUILD` and uses `AURAYALE_WEB_AUTH` so the website supplies the current account instead of restoring a previous Unity account. Both `EditorUserBuildSettings.webGLBuildSubtarget` and `BuildPlayerOptions.subtarget` are explicitly set (the latter otherwise resets the build to Generic). Desktop uses DXT and the original importer sizes; MobileASTC uses ASTC and a 1024 maximum. Existing explicit WebGL DXT/DXT Crunch overrides are temporarily changed to ASTC 6×6 without Crunch. Importer and Editor settings are restored in `finally` after each build; do not edit importers or forcibly terminate Unity while the build is running.

To import an existing build without rebuilding:

```sh
corepack pnpm deploy:unity ../gemfi-gaming/Builds/AurayaleWeb
# The nested Build directory also works. --keep N controls retained versions.
```

The importer accepts either the two-variant root or a legacy single-player output. It validates both variants before publishing the pair, converts gzip/raw builds to Brotli, normalises filenames, includes versioned StreamingAssets, writes asset hashes in manifest.json, and atomically switches version.json. With two variants, `--keep 3` retains up to six player directories, always protecting both selected builds. Build IDs contain Taipei time and a hash of the player, StreamingAssets, and variant identity. Commit the new directories and version.json together. Vercel deploys pushes to main to the existing production site.

The mobile import gate parses the actual Unity 6000.3 release `.data` archive and its Texture2D headers. It rejects a mobile player with zero ASTC textures, any DXT/BC texture, or a texture dimension above 1024. The result is saved as `textureAudit` in its manifest. Unsupported archive schemas fail closed. This is an asset-format check, not a measurement of browser or GPU memory.

```sh
node scripts/audit-unity-textures.mjs ../gemfi-gaming/Builds/AurayaleWeb/MobileASTC/Build/MobileASTC.data.unityweb --mobile
```

`version.json` retains a desktop `buildId` for old clients and adds `variants.desktop` and `variants.mobileAstc`. Before mounting Unity, mobile browsers probe `WEBGL_compressed_texture_astc` on a disposable WebGL2 context. Supported phones select MobileASTC; desktop browsers and unsupported devices use Desktop. The probe context is released immediately. Fallback avoids an unsupported ASTC format but does not guarantee low memory on a phone without ASTC.

For diagnostics, `/battle?unityBuild=desktop` selects Desktop, and `?unityBuild=mobile-astc` requests MobileASTC only when the extension is available. Combine with `unityDpr=1.5`, `2`, or `3` for controlled comparisons. The selected build, format and DPR are recorded in the privacy-safe `aurayale:webgl:last-render-budget` sessionStorage entry; no account tokens are logged. After the ASTC release, the iPhone 12 remained stable through repeated scene switches at DPR 3. The mobile default therefore uses a DPR cap of 3 and a 3-million-pixel budget. On a 390×844 canvas this is 1170×2532 pixels; larger viewports are limited by the pixel budget. `?unityDpr=1.5` can reproduce the earlier rendering budget.

Keep next.config.js and vercel.json in sync: `.unityweb` requires `Content-Encoding: br`; version directories are immutable; version.json uses no-store. Keep the neutral `.unityweb` filenames to avoid Vercel recompressing JavaScript or WebAssembly.

## Account flow

1. Open `/battle` or click Start Adventure on `/aurayale`.
2. Sign in through the existing Privy app (email, Google, or wallet). Reloads restore the Privy session automatically.
3. Exchange the Privy token at `/api/privy-login` using `bsc-testnet`; load the account's gems and deck. Shared login controls issue one request and share retry/error state.
4. Only after this succeeds, fetch version.json and mount the player.
5. After Unity loads, send `WebBridge.SetPlayerInfoJson` with the backend JWT, player ID, name, and wallet address. Unity's PlayerSessionService/PostLoginPipeline fetches the backend deck. No stale localStorage.battleDeck is sent.
6. Unity's Start button routes first-time players to the tutorial and returning players to the lobby using their server profile. Switching accounts clears the previous account's local tutorial/deck cache.

For local use, `.env.local` needs the **existing public** NEXT_PUBLIC_PRIVY_APP_ID. NEXT_PUBLIC_GAME_API_URL defaults to `https://aurayale.mustaversegames.xyz/api`, matching the current Unity player. The legacy NEXT_PUBLIC_API_URL is ignored so a stale Vercel setting cannot select the previous Zeabur deployment. A custom backend must also match the Unity GameServerApi scene configuration. Production continues using Vercel's existing Privy environment variable. Google/email sign-in requires the relevant domain to be permitted in the Privy app.

## Verification

The test suite checks concurrent login controls under StrictMode, retries after failure, logout during an in-flight request, account changes, battle access gating, bridge identity delivery, compressed artifact formats, versioned StreamingAssets, and safe failure when a build is invalid.

Before release, verify a real account at `/battle`, refresh the page, click Unity's Start button, and check the correct deck/name and tutorial/lobby routing. Never use a Privy access token or a placeholder as the Unity Bearer token; only the Aura backend JWT is valid.

On the affected iPhone 12, verify both Safari and Chrome: cold launch → OutGame → InGame → return to OutGame, repeat several battles, then reload and repeat with cached assets. Also test reopening after a previous crash: the failure point can vary with process/resource pressure. Confirm the selected build is `mobile-astc`; successful download or entry into OutGame alone is not sufficient. If a reload persists, collect the matching Jetsam/browser event before deciding whether scene-transition unloading or lightweight lobby data is the next fix.
