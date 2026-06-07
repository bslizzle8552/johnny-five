import type { FiveV2Controller, FiveV2ControllerContext, FiveV2Pose } from './fiveRigTypes';
import { smoothstep, wave } from './fiveMotionMath';

export class FiveMotionController implements FiveV2Controller {
  update(pose: FiveV2Pose, context: FiveV2ControllerContext) {
    if (context.mode === 'roll-test') {
      const travel = smoothstep((Math.sin(context.timeMs / 2400) + 1) / 2);
      pose.root.groundX = 420 + travel * 184;
      pose.parts.chassis = { ...pose.parts.chassis, rotation: wave(context.timeMs, 620, 0.2) * 0.18 };
      pose.parts.torso = { ...pose.parts.torso, rotation: wave(context.timeMs, 1300, 1.4) * -0.28 };
    }

    if (context.mode === 'turn-test') {
      const intent = wave(context.timeMs, 3600);
      pose.parts.head_bar = { ...pose.parts.head_bar, rotation: intent * 4.5, x: intent * 4 };
      pose.parts.torso = { ...pose.parts.torso, rotation: intent * 1.1 };
      pose.parts.chassis = { ...pose.parts.chassis, rotation: intent * 0.45 };
    }

    return pose;
  }
}
