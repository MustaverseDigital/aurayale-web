# Mobile touch and card UI fixes — 2026-11-15

Game source: [PR #81](https://github.com/MustaverseDigital/gemfi-gaming/pull/81), merged master `17839d512ecbb6c0d493228a29f0eed648269041`. Both account and exhibition players are built from this commit in isolated worktrees.

- Disable simultaneous multi-touch input in Unity and filter secondary touch/pointer events at both website canvases. Only the first finger owns a gesture, and an already held finger cannot take over after it lifts.
- Cancel a pending transmute before selecting another gem and preserve the newly selected card’s effect tips.
- Draw dragged gems and runes above the scoreboard, retaining card masks, labels, outlines, and their original rendering after release.
- Resolve the reserved drag layer safely when its name is not yet loaded; reject conflicting layer assignments before changing renderers. This prevents the invalid-layer errors and disappearing cards reported during drag.
- Activate ordinary buttons and bottom navigation tabs on pointer-down. Releasing, long-pressing, or dragging away does not duplicate the action; disabled controls and keyboard submission retain their guards.

## Validation

Unity checks passed for drag rendering (including unnamed and conflicting layers), dropped camera masks, card-name clipping, all 36 rune faces, and 48 overlapping-card poses with zero incorrect pixels. Item-tip selection/cancellation, pointer-down callbacks on the actual lobby tabs, disabled-button behavior, and release deduplication passed. The complete two-round tutorial retained 495 / 10128 damage; four normal transmute turns passed.

Website unit tests: 74 passed across nine files, including simultaneous touches, secondary cancellation, owner release, gesture recovery, pointer events, unrelated controls, teardown, and Unity’s deferred canvas ref. TypeScript and the Next.js production build passed. Mobile texture audits inspect the built archives rather than relying on Editor settings. Physical iPhone/iPad acceptance and a signed-in account session are separate manual checks.

Browser checks on the local production build passed: desktop Title and tutorial loading; mobile-ASTC lobby and battle loading; tab switching before touch release and after dragging away; dragged gems above the scoreboard and restoration after release. A second finger held over another card and moved did not open its long-press tips. The captured Unity-bound touch stream contains only the owner, with no page errors or invalid-layer errors. [Input capture](2026-11-15-touch-card-ui/browser-check.json), [tab on touch-down](2026-11-15-touch-card-ui/tab-touch-down.png), [second-finger drag](2026-11-15-touch-card-ui/drag-second-touch.png), [returned hand](2026-11-15-touch-card-ui/drag-returned.png). These checks use Chrome touch emulation and do not establish physical-device acceptance.

Existing account sessions need a reload to instantiate the new player. Exhibition devices with an offline resource package must use the explicit resource-update action on the start screen.

## Player inventory

| Route | Variant | Build ID |
| --- | --- | --- |
| /battle | desktop | `20261115-1730-69ea4e29460a` |
| /battle | mobileAstc | `20261115-1730-dbfa8d7fab5b` |
| /exhibition | desktop | `20261115-1741-01a548f89088` |
| /exhibition | mobileAstc | `20261115-1741-d3b216c46ea3` |

/battle: 704 textures, 628 ASTC, zero DXT/BC, zero dimensions above 1024; 449 temporary importer overrides restored.

/exhibition: 704 textures, 628 ASTC, zero DXT/BC, zero dimensions above 1024; 449 temporary importer overrides restored.
