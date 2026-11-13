# Rune animation overlap fix — 2026-11-13

Raised rune faces now keep a deterministic front-to-back order while tilting, scaling and scoring. The previous release only stopped idle motion during score reading. This release adds ordered overlay stencil clipping for the actual new rune materials, rebinds after face rebuilds/deck reorders and restores normal materials/layers afterward. Card motion and existing artwork/tint are retained.

Game source: [PR #79](https://github.com/MustaverseDigital/gemfi-gaming/pull/79), merged master `fda66774554f2761586880940b47d959b9902808`; account player built from `2940feb8` with an identical tree. Exhibition source `13774e1888084f7b6be9b49b85b90cd540f8e574` merges that master into the existing exhibition branch; its tree matches the tested local `f9994ae8` source.

| Route | Variant | Build ID | Auth |
| --- | --- | --- | --- |
| /battle | desktop | `20261113-2140-232882a51c49` | website |
| /battle | mobileAstc | `20261113-2140-299512ea2cd1` | website |
| /exhibition | desktop | `20261113-2150-e31b95fe7ef2` | local |
| /exhibition | mobileAstc | `20261113-2150-9609048673e8` | local |

Validation:

- A GPU positive-control reproduction measured 6,500 incorrectly owned overlap pixels with ordinary depth-tested faces. Ordered clipping produced zero wrong pixels out of 12,480 samples over 48 opposing tilt/depth/scale poses. Reversed order, exposed faces and material/mask restoration also passed.
- Full two-round tutorial and victory passed, including 23,704 checks of real overlay face shaders and matching, unique positive stencil IDs. Normal InGame transmute/cancellation, face rebuilding, empty-hand submission, two round transitions and next-turn reset passed with 19,819 face checks.
- Card-name regression passed: 4,049 baseline/fixed glyph pixels, zero with ordinary depth testing, 1,917 with an overlapping card mask.
- Desktop DXT and MobileASTC builds succeeded for both modes. Expanded UnityFS archives contain both overlay shaders. Each mobile archive has 704 textures, 628 ASTC, zero DXT/BC and zero above 1024. Importers validated hashes, compression, mode separation and exhibition offline inventories.
- Website: 67 tests, TypeScript and production Next.js build passed. Existing dependency/lint warnings remain.
- After deployment, verify both live version manifests, all four selected player inventories and compression/cache headers, then audit the served mobile archives.

Affected-iPhone/browser visual acceptance has not been performed. Formal players should reload the page; exhibition devices with an existing offline package must explicitly update resources from the exhibition start screen.
