import type { FiveV2Controller, FiveV2ControllerContext, FiveV2Pose } from './fiveRigTypes';
import { pulse, wave } from './fiveMotionMath';

export class FiveEyeController implements FiveV2Controller {
  update(pose: FiveV2Pose, context: FiveV2ControllerContext) {
    const lookX = wave(context.timeMs, 6400) * 4.5 + wave(context.timeMs, 11300, 1.8) * 2;
    const lookY = wave(context.timeMs, 7800, 0.9) * 1.6;
    const blinkWindow = pulse(context.timeMs, 8200, 1.1) > 0.982;
    const aperture = blinkWindow ? 0.18 : 1;
    const glow = 0.44 + pulse(context.timeMs, 3600, 0.5) * 0.28;

    for (const id of ['left_lens', 'right_lens']) {
      pose.parts[id] = { ...pose.parts[id], x: lookX, y: lookY, scaleY: aperture };
    }

    for (const id of ['left_eye_glow', 'right_eye_glow']) {
      pose.parts[id] = { ...pose.parts[id], x: lookX * 0.72, y: lookY * 0.72, opacity: glow * aperture };
    }

    return pose;
  }
}
