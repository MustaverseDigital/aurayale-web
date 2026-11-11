# 2026-11-12 tutorial combo release

Unity source: `04d402a96087ce38f55653e54689a18662ec5794`, [gemfi-gaming PR #76](https://github.com/MustaverseDigital/gemfi-gaming/pull/76).

The first turn teaches three matching numbers with one resonance gem. The second turn teaches two separate straight flushes, all six qualifying pattern contributions, and chain/color gem stacking. The complete Editor scenario deals 495 then 10128 damage. Dela dialogue supports tap-anywhere reading, waits until score/clash animation boundaries, uses the selected language, and avoids phase indicators and interaction targets in battle and lobby.

## Players

| Variant | Build ID | Actual data-archive audit |
| --- | --- | --- |
| Desktop DXT | `20261112-0158-c7649aaa59de` | 704 Texture2D; 486 desktop-compressed, 0 ASTC |
| Mobile ASTC | `20261112-0158-b5aff056231f` | 704 Texture2D; 628 ASTC; 0 DXT/BC; 0 above 1024 |

Both variants use Unity 6000.3.1f1, website authentication and the Title / InGameTutorial / InGame / OutGame scene sequence. The mobile build temporarily converted 449 DXT overrides to ASTC; Unity exited successfully after restoring importer and Editor settings.

## Validation and retention

- Unity 390×844 two-round pointer-driven lesson passes. The source PR contains the trace and screenshots.
- Website: 59 tests, TypeScript, Next ESLint and the production build pass.
- The deploy importer verifies both compressed players and the actual mobile archive before switching the paired manifest.
- Imported with `--keep 1`: only this Desktop/Mobile pair remains. `public/Build` falls from 584644 KiB to 120256 KiB, a reduction of about 454 MiB. Historical Git commits remain available.
- Physical mobile-browser regression has not been repeated for this release. Compression and asset audits do not measure browser/GPU memory.
