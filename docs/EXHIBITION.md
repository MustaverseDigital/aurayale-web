# Offline exhibition demo

The account-free demo is `/exhibition`. The Aurayale page links to it with a full document navigation. It uses a separate Unity player and does not mount Privy, Wagmi, account state, advertisements, or reward claims. `/battle` keeps its account login flow.

## Build and import

With the Unity Editor closed:

```sh
corepack pnpm build:exhibition
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
corepack pnpm start
```

This invokes `Aurayale.Editor.WebGLBuild.BuildExhibitionVariants` in the sibling gaming project. It builds Desktop DXT and MobileASTC with `EXHIBITION_BUILD` and `AURAYALE_WEB_AUTH`, reusing the existing mobile texture limits, temporary importer overrides and restoration. Output is `gemfi-gaming/Builds/AurayaleExhibition`; logs go to `gemfi-gaming/Logs/aurayale-exhibition-build.log`.

To import an already finished pair, including a build started from the Editor:

```sh
corepack pnpm deploy:exhibition
# Or: corepack pnpm deploy:exhibition /absolute/path/to/variant-root
```

Importing is local artifact preparation; it does not publish the website. Import before starting the production server, or restart the server after adding new public files. Both players must declare `exhibition: true` and `authMode: local`. An account player is rejected. The normal importer continues rejecting exhibition players.

Assets and version manifests live under `public/ExhibitionBuild/`, independently of `public/Build/`. Each player has a SHA-256 inventory of all offline assets, including StreamingAssets; compressed Unity files record the **decoded** response hash and byte length. Mobile archives pass the existing ASTC / no-DXT / 1024 texture audit. Keep the new headers in `next.config.js` and `vercel.json` aligned.

## Local gameplay data

Unity owns the deck and tutorial state. Exhibition preference accesses use `ExhibitionPlayerPrefs`; ordinary account builds still use Unity's original keys. WebGL exhibition preferences use `localStorage` keys prefixed `aurayale.exhibition.v1.`, so a change of immutable build URL does not change the save location.

The demo starts with a valid ten-card deck and the existing gem collection pool. It supports the full battle tutorial followed by the lobby/deck tutorial. Battle tutorial completion and pending lobby tutorial state are separate; interrupted tutorial sections restart from a safe section boundary. A tutorial's rigged deck remains owned by its scene. Regular exhibition battles always load the local deck even if a scene has `loadCardDeckOnAwake` disabled; that Inspector setting must not select `testCardDeck` in the demo.

The main-stage allowlist is `gemfi-gaming/Assets/AuraBattle/Resources/DataSO/ExhibitionStages.json`: the current thirty chapter stages. A matching stage must also declare `StageCategory.Main`. Selection and the battle engine reject other stages; only the tutorial scene may load its tutorial configuration. No `/stage/enter`, cloud score submission, UGS initialization or stamina synchronization is required. Best scores and played-stage markers are local; there are no account rewards or deferred uploads.

The player menu exposes tutorial replay, exit to the demo start screen, and a confirmed next-player reset. Reset deletes exhibition preferences and runtime selection, without clearing account keys or the downloaded resource package. Storage failures are shown to the player.

## Offline preparation

Use a production build over HTTPS, or localhost. The initial download requires a connection. Click **Prepare offline play** before starting Unity; downloading and hashing large resources while a player is active would increase memory pressure.

The worker at `/exhibition/sw.js` has scope `/exhibition`, handles only exhibition navigation and explicitly allowed static resources, and never caches account pages or API calls. Preparation downloads a fresh exhibition version, selected texture variant, all player assets, the page HTML and its Next.js scripts/styles/fonts. It verifies player assets before atomically selecting the completed package. A failed update keeps the previous package. Running tabs can continue fetching immutable assets from their prior package.

After preparation the page reloads into the saved package. Reopening the URL, including its version lookup, works without the network. Updating resources is an explicit operation from the start screen. Browser storage may be evicted or cleared; the readiness check detects missing player assets. A new device cannot download the demo without some initial connection. For fixed exhibition equipment retain the static build as a reinstallable backup.

## Release checks

- Use a clean browser to finish both tutorials, edit a valid ten-card deck, enter several main stages, return and reopen the page. Verify the same deck in battle and in the editor.
- Prepare resources, close the tab, disable networking and reopen `/exhibition`. Verify tutorial, deck editing, battle, local result and next-player reset. Check network logs for API, Privy, RPC, UGS, ad and external-image traffic.
- Deliberately select an event asset and restore an old activity tab; both must be rejected. An incomplete deck must not enter battle.
- Confirm reset leaves account keys and downloaded resources intact; tutorial replay preserves the deck. Check `/battle` login and identity delivery with a real account.
- Confirm decoded asset hashes and HTTP Brotli headers. On an actual iPhone, verify the selected MobileASTC archive and repeat ten lobby/battle transitions using the gaming project's `WEBGL_MOBILE_RENDERING_RUNBOOK.md`.

Automated tests cover local bridge actions, reset confirmation, failed preparation, complete offline resource serving, corrupt update rollback, eviction detection and build-mode isolation. Browser and iPhone checks remain separate from unit-test results.
