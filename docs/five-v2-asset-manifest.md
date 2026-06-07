# Johnny Five V2 Puppet Asset Manifest

V2 requires new transparent PNG puppet artwork under `src/assets/five-v2/`. Legacy full-body Johnny art, old rig exports, SVG, CSS shapes, canvas shapes, and placeholder robot parts are not acceptable production assets.

All PNGs must have transparent backgrounds, consistent lighting, and matching perspective. Recommended rig canvas: `320x430` CSS pixels at `2x` source resolution. Pivot coordinates below are measured from each part image's top-left corner.

| Filename | Recommended size | Parent | Pivot | Z | Visual description and overlap notes |
| --- | ---: | --- | ---: | ---: | --- |
| `left_tread_housing.png` | 252x192 | `chassis` | 126,172 | 30 | Left metal tread shell with open belt window. Overlaps left belt frames and sits above them. Bottom contact remains on floor. |
| `right_tread_housing.png` | 252x192 | `chassis` | 126,172 | 30 | Right metal tread shell with open belt window. Overlaps right belt frames and sits above them. Bottom contact remains on floor. |
| `left_tread_belt_00.png` | 224x132 | `chassis` | 112,116 | 10 | Left belt artwork frame 0 with visible tread lugs inside the housing window. Same bounds as frames 1-3. |
| `left_tread_belt_01.png` | 224x132 | `chassis` | 112,116 | 10 | Left belt artwork frame 1, advanced by one quarter tread pitch from frame 0. |
| `left_tread_belt_02.png` | 224x132 | `chassis` | 112,116 | 10 | Left belt artwork frame 2, advanced by two quarter tread pitches from frame 0. |
| `left_tread_belt_03.png` | 224x132 | `chassis` | 112,116 | 10 | Left belt artwork frame 3, advanced by three quarter tread pitches from frame 0. |
| `right_tread_belt_00.png` | 224x132 | `chassis` | 112,116 | 10 | Right belt artwork frame 0 with matching tread lug spacing. |
| `right_tread_belt_01.png` | 224x132 | `chassis` | 112,116 | 10 | Right belt artwork frame 1, advanced by one quarter tread pitch. |
| `right_tread_belt_02.png` | 224x132 | `chassis` | 112,116 | 10 | Right belt artwork frame 2, advanced by two quarter tread pitches. |
| `right_tread_belt_03.png` | 224x132 | `chassis` | 112,116 | 10 | Right belt artwork frame 3, advanced by three quarter tread pitches. |
| `chassis.png` | 360x184 | root | 180,164 | 50 | Heavy central base above both treads. Lower edge should visually sit on housings without hiding belt windows. |
| `torso.png` | 276x236 | `chassis` | 138,216 | 80 | Worn industrial torso with warm metal finish. Bottom overlaps chassis top. |
| `neck_mount.png` | 104x144 | `torso` | 52,132 | 90 | Mechanical neck strut assembly. Pivots at torso socket and carries head. |
| `head_bar.png` | 360x176 | `neck_mount` | 180,144 | 120 | Horizontal camera bar head. Pivots from neck center. Eye housings mount on top. |
| `left_eye_housing.png` | 116x104 | `head_bar` | 58,52 | 140 | Left camera eye housing, worn metal, circular front glass opening. |
| `right_eye_housing.png` | 116x104 | `head_bar` | 58,52 | 140 | Right camera eye housing, matching perspective and slightly asymmetrical wear. |
| `left_lens.png` | 44x36 | `left_eye_housing` | 22,18 | 150 | Glass lens seated inside left housing. Must allow small x/y movement inside housing. |
| `right_lens.png` | 44x36 | `right_eye_housing` | 22,18 | 150 | Glass lens seated inside right housing. Must allow small x/y movement inside housing. |
| `left_eye_glow.png` | 76x56 | `left_lens` | 38,28 | 160 | Soft transparent cyan/blue lens highlight. No rectangular bounds or black background. |
| `right_eye_glow.png` | 76x56 | `right_lens` | 38,28 | 160 | Soft transparent cyan/blue lens highlight matching right lens. |
| `left_shoulder_joint.png` | 64x64 | `torso` | 32,32 | 110 | Left shoulder hinge disk/socket. Upper arm pivots from it. |
| `left_upper_arm.png` | 120x72 | `left_shoulder_joint` | 104,36 | 100 | Left upper manipulator segment. Shoulder pivot at inner end. |
| `left_lower_arm.png` | 116x68 | `left_upper_arm` | 100,24 | 100 | Left forearm segment. Elbow pivot at inner end, gripper overlaps outer end. |
| `left_gripper.png` | 80x76 | `left_lower_arm` | 64,36 | 110 | Left small gripper claw with metal fingers. Pivots at wrist socket. |
| `right_shoulder_joint.png` | 64x64 | `torso` | 32,32 | 110 | Right shoulder hinge disk/socket. Upper arm pivots from it. |
| `right_upper_arm.png` | 120x72 | `right_shoulder_joint` | 16,36 | 100 | Right upper manipulator segment. Shoulder pivot at inner end. |
| `right_lower_arm.png` | 116x68 | `right_upper_arm` | 16,24 | 100 | Right forearm segment. Elbow pivot at inner end, gripper overlaps outer end. |
| `right_gripper.png` | 80x76 | `right_lower_arm` | 16,36 | 110 | Right small gripper claw with metal fingers. Pivots at wrist socket. |
| `red_toolbox.png` | 156x140 | `torso` | 36,104 | 130 | Red shoulder toolbox mounted high on right side. Slightly worn paint. Overlaps torso and may tuck behind head area. |
| `indicator_light_amber.png` | 56x56 | `torso` | 28,28 | 170 | Warm amber indicator lamp with transparent glow edge. Pulses independently. |

Optional PNGs:

| Filename | Recommended size | Parent | Pivot | Z | Notes |
| --- | ---: | --- | ---: | ---: | --- |
| `antenna.png` | 60x96 | `head_bar` | 30,88 | 135 | Thin top antenna, if used. |
| `sensor_top_left.png` | 44x44 | `head_bar` | 22,22 | 136 | Small top sensor detail, transparent. |
| `sensor_top_right.png` | 44x44 | `head_bar` | 22,22 | 136 | Small top sensor detail, transparent. |
| `small_wires.png` | 120x80 | `torso` | 60,40 | 95 | Small exposed wires tucked behind arm/neck parts. |
| `wear_overlay.png` | 320x430 | root | 160,390 | 300 | Transparent grime/scratch pass only, never a full-body silhouette. |

## Tread Animation

Tread frames must be real transparent PNG artwork. Each side needs four frames with identical dimensions, identical transparent bounds, and a visible quarter-pitch tread lug advance between frames. Housings stay still. Belt frames cycle while root position is locked in tread-test mode. No blur, dark boxes, smear overlays, or CSS-generated tread marks are allowed.

## Eye And Lens Animation

Eye housings are mostly stable with slight head-follow. Lenses and glows move independently inside the housings by a few pixels. Blink/aperture can scale the lens/glow vertically around each lens center. Glow opacity pulses softly; it must not reveal a rectangular PNG boundary.

## Arm Joint Pivots

Shoulder joints pivot at their center sockets. Upper arms pivot at shoulder-side ends. Lower arms pivot at elbow-side ends. Grippers pivot at wrist-side ends. Artwork must include enough overlap at joints to prevent gaps during small rotations.

## Floor Contact Points

The V2 root is the ground contact point, not the image top-left. Initial stage constants are `floorY=460`, `baseCenterPoint=(0,-72)`, `leftTreadContactPoint=(-82,0)`, and `rightTreadContactPoint=(82,0)`. Tread housing bottoms must visually align to those floor contacts.
