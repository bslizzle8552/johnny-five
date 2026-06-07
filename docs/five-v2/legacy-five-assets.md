# Legacy 5 Asset Blocklist

These assets are deprecated for V2 runtime use. They may be used only as visual reference outside `src/components/five-v2/` and `src/five-v2/`.

## Legacy Roots

- `assets/five/`
- `src/assets/five/`
- `visual_foundation/`

## Legacy Full-Body And Pose Assets

- `assets/five/production/core/charging.png`
- `assets/five/production/core/confused.png`
- `assets/five/production/core/curious.png`
- `assets/five/production/core/excited.png`
- `assets/five/production/core/happy.png`
- `assets/five/production/core/idle.png`
- `assets/five/production/core/investigating.png`
- `assets/five/production/core/listening.png`
- `assets/five/production/core/reading.png`
- `assets/five/production/core/sleeping.png`
- `assets/five/production/core/talking.png`
- `assets/five/production/core/thinking.png`
- `assets/five/production/core/wake-up.png`
- `assets/five/production/core/working.png`
- `assets/five/production/movement/looking-down.png`
- `assets/five/production/movement/looking-up.png`
- `assets/five/production/movement/rolling-backward.png`
- `assets/five/production/movement/rolling-forward.png`
- `assets/five/production/movement/scanning.png`
- `assets/five/production/movement/turning-left.png`
- `assets/five/production/movement/turning-right.png`
- `assets/five/sources/approved/*.png`
- `assets/five/sources/generated-green/*.png`
- `visual_foundation/*.png`

## Legacy Extracted Parts And Rig Assets

- `src/assets/five/parts/*.png`
- `src/assets/five/rig/*.png`
- `src/assets/five/rig/rig-asset-manifest.json`

## Enforcement

- `npm run five-v2:check-legacy` fails if V2 source files reference these paths.
- `npm run five-v2:assets:validate` fails if a required V2 part is missing, lacks transparency, is empty, retains chroma magenta, looks like a black rectangle, or exactly matches a legacy PNG file.
