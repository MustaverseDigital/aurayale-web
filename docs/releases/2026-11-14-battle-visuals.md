# Battle presentation and transmute fixes — 2026-11-14

Game source: [PR #80](https://github.com/MustaverseDigital/gemfi-gaming/pull/80), merged master `445fc92526c21c8bebeae41884ff04378a564dfb`. Account builds use `34ba3a5c8714cea963824db3692e1c4730703c76`, whose tree matches merged master. Exhibition source `7fcc0674aa1661bf1021300a5b83f29492f8442f` integrates merged master into the existing exhibition branch; its tree matches the tested local `4c9af41a`.

- Raised rune faces retain their corner numbers and suit indices, with ordered clipping for faces, glow and transmute sweeps.
- Submitting a selected transmute without a rune target discards it without applying its effect; empty-hand and normal bonus turns remain usable.
- Tutorial focus has a breathing gold halo. Cards clear before the total gathers above the lowered scoreboard; accelerating elemental comets converge on the actual enemy hit mount.
- Volley count increases with displayed damage and distinct scored elements, capped at 16. Player buff icons retract off the left screen edge and slide back with the next hand.

## Validation

Real GPU index rendering: baseline/overlay 5118 pixels, clipped 2564; original materials restore. Forty-eight overlapping poses: zero wrong pixels out of 12480. Glow/sweep and card-name regression passed. Normal InGame transmute apply/cancel/discard and four round transitions passed. Complete two-round tutorial retained 495 / 10128 damage, verified 13 enemy-hit comet arrivals and horizontal buff hide/return.

Website tests: 67 passed; TypeScript passed. Desktop DXT and MobileASTC archives, Next production build and deployed manifests are verified as part of this release. Device/browser visual acceptance is not established by these automated checks.

Existing exhibition offline packages require the explicit resource-update action on the exhibition start screen. Account players must reload to instantiate the new Unity build.

## Player inventory

| Route | Variant | Build ID |
| --- | --- | --- |
| /battle | desktop | `20261114-1107-b12ee3852d2b` |
| /battle | mobileAstc | `20261114-1107-3b265fdfdd0d` |
| /exhibition | desktop | `20261114-1123-b4b0a9b0e01a` |
| /exhibition | mobileAstc | `20261114-1123-670cac345f5c` |

Both mobile archives: 704 textures, 628 ASTC, zero DXT/BC, zero dimensions above 1024. Both pairs contain the element-face and overlay shaders. Account mode is website; exhibition mode is local.
