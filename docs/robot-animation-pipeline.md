# Robot Animation Pipeline

Johnny Five v0.1 is pivoting from the old tracked/sprite artwork pipeline to a rigged humanoid robot animation pipeline.

## Current Plan

1. User downloads Tripo FBX exports.
2. User places them in `public/robot/original_tripo_exports/`.
3. Codex inspects files to determine whether each contains mesh, rig, and animation or animation only.
4. Convert usable files to GLB/glTF.
5. Build a React/Three.js viewer.
6. Add buttons for Idle, Walk, Wave, Scared, Turn, and Dance.
7. Later replace buttons with a behavior controller.

## Folder Roles

- `public/robot/original_tripo_exports/` holds untouched FBX downloads from Tripo.
- `public/robot/processed/` will hold converted and optimized GLB/glTF files for runtime use.
- `public/robot/previews/` will hold screenshots, contact sheets, and review renders.
- `public/robot/manifest.json` will describe available model and animation files once assets are added.

## Notes

- Do not overwrite original Tripo exports.
- Do not import robot files into the app until the assets have been inspected and converted.
- Do not install Three.js or React Three Fiber packages until the viewer implementation begins.
- The old tracked/sprite artwork pipeline is archived separately under `archive/old-johnny-five-artwork-2026-06-07/`.
