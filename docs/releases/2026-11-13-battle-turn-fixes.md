# Battle turn fixes — 2026-11-13

Fixes: consumed transmute gems enable End Turn even with no picked cards or an empty hand; scoring rune cards stop their continuous idle motion while the player reads the result.

Sources: gaming [PR #78](https://github.com/MustaverseDigital/gemfi-gaming/pull/78), merged master `79d26415` (account player tree built at `859129e8`); exhibition source `1f709fa0`, incorporating that master into the existing exhibition branch. Website [PR #96](https://github.com/MustaverseDigital/aurayale-web/pull/96).

| Route | Variant | Build ID | Auth |
| --- | --- | --- | --- |
| /battle | desktop | `20261113-1645-034f7934903f` | website |
| /battle | mobileAstc | `20261113-1645-fbb2e4a38952` | website |
| /exhibition | desktop | `20261113-1657-c996b521660c` | local |
| /exhibition | mobileAstc | `20261113-1657-7617678a5653` | local |

Validation:

- Desktop DXT and MobileASTC players built for both routes. Both actual mobile archives contain 704 textures, 628 ASTC, zero DXT/BC and zero textures above 1024. Hashes, compression and mode separation are validated by the importers.
- Real InGame tests covered one transmute, five consumed transmutes, zero picked cards, an empty hand, target cancellation, next-turn reset and normal bonus selection/deselection. Two round transitions completed.
- Scoring-card integration checks verify stable position, rotation and scale during the first score reading gate; the full two-round tutorial completed.
- Website: 67 tests, TypeScript and production Next.js build passed. Existing dependency/lint warnings remain.
- Both manifests and immutable resource directories are published together. Production verification compares each selected player file against its manifest hash, checks Brotli/immutable response headers and audits the served mobile archive.

Exhibition devices that prepared an offline package must explicitly update resources from the exhibition start screen to use this release. Their previous package remains valid until updated.

Editor and build/HTTP checks do not replace a real-account browser walkthrough or iPhone device testing; those were not run in this release.
