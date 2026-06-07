# 5 Animation Asset Package

This package contains the production-ready animation asset set for `5`.

The approved character design was not replaced. The original visual foundation is archived under `assets/five/sources/approved/`, and production sprites were created as transparent derivatives for app animation.

## Structure

- `sources/approved/` - copied approved foundation artwork and contact sheet.
- `sources/generated-green/` - chroma-key source renders used for alpha export.
- `production/core/` - transparent PNGs for core emotional/behavior states.
- `production/movement/` - transparent PNGs for movement and look states.
- `manifests/asset-manifest.json` - machine-readable state manifest.
- `manifests/production-contact-sheet.png` - quick visual review sheet.
- `../../tools/export-five-alpha.ps1` - local chroma-key to alpha exporter.

## Production Format

- PNG with alpha channel.
- 1024 x 1536 canvas.
- Transparent background.
- Consistent centered framing and scale.
- Full-body character sprites suitable for React/Vite/TypeScript rendering.

## Core States

- Idle
- Curious
- Thinking
- Listening
- Talking
- Excited
- Happy
- Confused
- Investigating
- Reading
- Working
- Charging
- Sleeping
- Wake Up

## Movement States

- Rolling Forward
- Rolling Backward
- Turning Left
- Turning Right
- Looking Up
- Looking Down
- Scanning

## Existing Approved Assets Reused

The following approved foundation files were copied into `sources/approved/` and used as the locked design reference:

- `01-character-concept-sheet.png`
- `02-front-view.png`
- `03-side-view.png`
- `04-three-quarter-view.png`
- `05-hero-pose.png`
- `06-idle-pose.png`
- `07-curious-pose.png`
- `08-thinking-pose.png`
- `09-talking-pose.png`
- `10-excited-pose.png`
- `11-charging-pose.png`
- `12-sleeping-pose.png`
- `contact-sheet.png`

Production derivatives were made from approved source artwork for:

- Idle
- Curious
- Thinking
- Talking
- Excited
- Charging
- Sleeping

Charging and sleeping retain their approved charging connector/dock context because those props define the state.

## New Assets Generated

New production derivatives were generated only for states that did not have a direct approved foundation pose:

- Listening
- Happy
- Confused
- Investigating
- Reading
- Working
- Wake Up
- Rolling Forward
- Rolling Backward
- Turning Left
- Turning Right
- Looking Up
- Looking Down
- Scanning

## Missing Assets Still Required

None for the first living prototype state package.

Future animation polish may add frame sequences, layered eye-light passes, track tread loops, or separate prop layers, but those are animation-system enhancements rather than missing character design assets.

## Usage Notes

Use `manifests/asset-manifest.json` as the integration source of truth. Treat production files as app-ready sprites and source files as audit/re-export material.
