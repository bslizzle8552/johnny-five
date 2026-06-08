# Robot Asset Inspection - 2026-06-07

The Tripo FBX exports in `public/robot/original_tripo_exports/` were inspected and converted to binary glTF files in `public/robot/processed/`.

Original files were not renamed, moved, or edited.

## Conversion

- Tool: `FBX2glTF v0.9.7`
- Output format: binary glTF `.glb`
- Output folder: `public/robot/processed/`
- Compression: none

## Optimization

- Tool: `gltf-transform optimize v4.4.0`
- Output naming: `*_optimized.glb`
- Geometry simplification target: 45 percent
- Texture size cap: 1024 px
- Runtime geometry compression: disabled for the first viewer pass

Compression was intentionally left off so the basic Three.js viewer can load the files without Draco or Meshopt decoder setup.

## Converted Files

| Source | Processed GLB | Result |
| --- | --- | --- |
| `28281943-3e78-4495-a411-71c325a06071_fbx_afraid.fbx` | `afraid.glb` | Converted successfully. |
| `78d8819f-3c86-47ee-a059-6b2f61e823f9_fbx_turn_scared_02_dance_05_idle.fbx` | `turn_scared_dance_idle.glb` | Converted successfully. |
| `ac36077d-05d7-4e15-95de-1a4576f358dd_fbx_greet_01.fbx` | `greet_01.glb` | Converted successfully. |
| `Walking.fbx` | `walking.glb` | Converted successfully. |

## Optimized Files

| Processed GLB | Optimized GLB | Approximate size |
| --- | --- | --- |
| `afraid.glb` | `afraid_optimized.glb` | 25.85 MB |
| `turn_scared_dance_idle.glb` | `turn_scared_dance_idle_optimized.glb` | 26.11 MB |
| `greet_01.glb` | `greet_01_optimized.glb` | 27.61 MB |
| `walking.glb` | `walking_optimized.glb` | 26.01 MB |

## Inspection Summary

The converted FBX files each contain:

- 1 scene
- 57 nodes
- 1 mesh
- 1 skin
- 1 material
- 1 texture image
- One or more animation clips

The static source file `t-pose basic robot.glb` contains:

- 1 scene
- 1 node
- 1 mesh
- 0 skins
- 0 animations

## Animation Clips

### `afraid.glb`

- `Armature.001|stand-afraid-f_SphereSkin.059|Base Layer_remap`
- `Armature|Armature.001|stand-afraid-f_SphereSkin.059|Base Layer_remap`

### `turn_scared_dance_idle.glb`

- `Armature.001|orc-turn-cw180_remap`
- `Armature.002|stand-scared-m_SphereSkin.061|Base Layer_remap`
- `Armature.003|taunt-dance-loop_SphereSkin.040|Base Layer_remap`
- `Armature.004|idle_251105_remap`
- `Armature|Armature.001|orc-turn-cw180_remap`
- `Armature|Armature.002|stand-scared-m_SphereSkin.061|Base Layer_remap`
- `Armature|Armature.003|taunt-dance-loop_SphereSkin.040|Base Layer_remap`
- `Armature|Armature.004|idle_251105_remap`

### `greet_01.glb`

- `Armature.001|move_greet_m_SphereSkin.013|Base Layer_remap`
- `Armature|Armature.001|move_greet_m_SphereSkin.013|Base Layer_remap`

### `walking.glb`

- `Armature.001|sit_seeya_m_SphereSkin.011|Base Layer_remap`
- `Armature.002|walk_normal_m_remap`
- `Armature.003|listener-agree-f_SphereSkin.017|Base Layer_remap`
- `Armature.004|stand-afraid-f_SphereSkin.059|Base Layer_remap`
- `Armature|Armature.001|sit_seeya_m_SphereSkin.011|Base Layer_remap`
- `Armature|Armature.002|walk_normal_m_remap`
- `Armature|Armature.003|listener-agree-f_SphereSkin.017|Base Layer_remap`
- `Armature|Armature.004|stand-afraid-f_SphereSkin.059|Base Layer_remap`

## Notes

- Several clips appear duplicated with and without an `Armature|` prefix. The viewer should test which duplicate plays correctly before final behavior mapping.
- `Walking.fbx` contains more than walking; it also includes sit/goodbye, agree/listener, and afraid clips.
- `turn_scared_dance_idle.glb` contains the expected turn, scared, dance, and idle clips.
- `greet_01.glb` is quarantined from the viewer because screenshot inspection showed a mismatched gray character instead of the Johnny Five robot.
- `walking_optimized.glb` is framed and centered in the viewer, but the source walking clip still reads like an exaggerated high-step pose. A better walk export may be needed.
- The generated GLBs are large, roughly 56-59 MB each. They should be optimized before final runtime use.
- The first optimized pass reduces the files to roughly 26-28 MB each.
- `src/components/robot/RobotViewer.tsx` loads the optimized files and randomizes through curated animation actions.
- The current app entry now shows the robot viewer instead of the old asset review screen.
