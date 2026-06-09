# Johnny Motion Training Objective

Goal: make Johnny's procedural motion as close as possible to the supplied reference animations without playing those animations directly.

The coach treats the reference GLB files as movement teachers. It extracts target measurements for each skill, then scores Johnny's current procedural profile against those targets.

Current measured skills:

- Walk: timing, stride phase speed, foot pitch range, toe curl range, upper-arm swing, forearm flex.
- Turn: turn duration and detected step count.
- Idle: idle duration and small-motion constraint.
- Wave: reference duration, ready for later procedural wave controls.
- Dance: reference duration, ready for later procedural dance controls.
- Long step: step duration, foot pitch range, toe curl range.
- Jab: jab duration, lead-arm reach, forearm snap.
- Long-step jab: combined timing target for stepping forward into the lead jab.

Pass target:

- Overall profile score must reach at least 92.

Important limit:

- This score says the procedural motion profile matches extracted reference measurements. It does not yet prove the rendered puppet looks perfect from camera view. The next training step is a generated-motion grader that samples Johnny's procedural poses frame by frame and compares them against the reference motion curves.
