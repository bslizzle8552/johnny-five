# Old Johnny Five Artwork Archive - 2026-06-07

This archive preserves the pre-humanoid Johnny Five v0.1 artwork pipeline before the pivot to a rigged humanoid robot animation system. Nothing was deleted; files were moved here with their original repo-relative paths preserved.

## Why this was archived

The moved files belong to the old tracked/sprite/static-character pipeline: pose sheets, production PNG derivatives, chroma/generated concept passes, old rig part exports, rejected V2 puppet assets, review sheets, and static environment or screenshot art. They are obsolete for the next 3D humanoid robot system but remain useful as reference and audit history.

## Moved paths

| Original path | Archived path | Contents |
| --- | --- | --- |
| `assets/five/` | `archive/old-johnny-five-artwork-2026-06-07/assets/five/` | Old approved pose/concept sheets, generated-green sources, production core/movement PNGs, contact sheet, and asset manifest. |
| `visual_foundation/` | `archive/old-johnny-five-artwork-2026-06-07/visual_foundation/` | Original visual foundation README, contact sheet, and 12 concept/pose PNGs. |
| `src/assets/five/parts/` | `archive/old-johnny-five-artwork-2026-06-07/src/assets/five/parts/` | Old static robot part PNG exports that were not imported by the current TypeScript build. |
| `src/assets/five-v2/rejected/` | `archive/old-johnny-five-artwork-2026-06-07/src/assets/five-v2/rejected/` | Rejected V2 puppet source sheets, sliced parts, and review contact sheet. |
| `src/assets/five-v2/reference/` | `archive/old-johnny-five-artwork-2026-06-07/src/assets/five-v2/reference/` | V2 master reference PNG. |
| `review-images/` | `archive/old-johnny-five-artwork-2026-06-07/review-images/` | Local review PNGs for master robot and base/tread review. |
| `public/assets/cinematic-workshop.png` | `archive/old-johnny-five-artwork-2026-06-07/public/assets/cinematic-workshop.png` | Old static workshop/background artwork. |
| `docs/archive/screenshots/v1-current-state.png` | `archive/old-johnny-five-artwork-2026-06-07/docs/archive/screenshots/v1-current-state.png` | Old V1 visual-state screenshot. |

## Intentionally left in place

- `src/assets/five/rig/` remains in place because `src/animation/five/fiveRigConfig.ts` still imports those PNG files, and moving them would break the TypeScript build while the old source code is still included.
- `public/icons/icon-192.svg` and `public/icons/icon-512.svg` remain in place because `index.html` and `public/manifest.webmanifest` still reference them as app icons.
- `src/assets/five-v2/.gitkeep` and `src/assets/five-v2/approved/.gitkeep` remain in place as empty anchors for future approved V2 assets.
- Existing documentation under `docs/` remains in place. Some docs intentionally mention old paths as historical inventory and migration notes.
- `dist/` was not archived because it is ignored build output and can be regenerated.

## Remaining references after archive

- `src/animation/five/fiveRigConfig.ts` imports `../../assets/five/rig/*.png`; those assets were left in place for build safety.
- `src/components/five-v2/FiveV2AssetReview.tsx` and `src/five-v2/fiveV2RigManifest.ts` still point to future active asset locations under `src/assets/five-v2/source/`, `src/assets/five-v2/review/`, and `src/assets/five-v2/parts/`. Those folders/files are not created by this archive-only task.
- `scripts/five-v2-assets/validate-assets.ts`, `scripts/five-v2-assets/check-no-legacy-five-assets.ts`, and `scripts/check-no-legacy-five-assets.ts` still reference legacy path patterns for validation and duplicate-art checks.
- `docs/legacy-five-assets.md`, `docs/five-v2/legacy-five-assets.md`, `docs/archive/v1-asset-inventory.md`, `docs/archive/v1-current-visual-state.md`, `docs/five-v2/asset-plan.md`, and `docs/five-v2/master-reference.md` include historical references to paths that now live in this archive.

## Verification

- `npm run build` passed after the archive move.
- `npm run check:five-v2` was run separately and failed because the future approved files under `src/assets/five-v2/parts/` are missing. This is expected after archiving the old/rejected art and before adding the new humanoid robot assets.

## Notes for the humanoid robot pivot

- New humanoid robot files should be added separately, after this archive commit.
- If old `src/animation/five/*` code is removed or excluded later, `src/assets/five/rig/` can be moved into this archive in a follow-up.
- If docs need live links to old images, update those links to `archive/old-johnny-five-artwork-2026-06-07/...`.
