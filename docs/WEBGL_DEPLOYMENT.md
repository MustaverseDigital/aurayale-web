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

`build:unity` invokes `Aurayale.Editor.WebGLBuild.Build` in `../gemfi-gaming`, logs to `gemfi-gaming/Logs/aurayale-webgl-build.log`, then imports the result into `public/Build/<buildId>/`. Supply a different Unity project as its first argument; set `UNITY_EDITOR_PATH` to override the editor executable.

The build starts with Title and includes InGameTutorial, InGame, and OutGame. It rejects `EXHIBITION_BUILD` and uses `AURAYALE_WEB_AUTH` so the website supplies the current account instead of restoring a previous Unity account. The editor's compression settings are restored after building.

To import an existing build without rebuilding:

```sh
corepack pnpm deploy:unity ../gemfi-gaming/Builds/AurayaleWeb
# The nested Build directory also works. --keep N controls retained versions.
```

The importer validates the complete player before publishing, converts gzip/raw builds to Brotli, normalises filenames, includes versioned StreamingAssets, writes asset hashes in manifest.json, and atomically switches version.json. It retains the latest three players. Build IDs contain Taipei time and a hash of the player and StreamingAssets. Commit the new directory, version.json, and removed old versions together. Vercel deploys pushes to main to the existing production site.

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
