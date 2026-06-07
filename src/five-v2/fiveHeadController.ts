import type { FiveV2Controller, FiveV2ControllerContext, FiveV2Pose } from './fiveRigTypes';
import { wave } from './fiveMotionMath';

export class FiveHeadController implements FiveV2Controller {
  update(pose: FiveV2Pose, context: FiveV2ControllerContext) {
    const thoughtTurn = wave(context.timeMs, 8200, 0.7);
    const scanLift = wave(context.timeMs, 9700, 2.1);

    pose.parts.neck_mount = {
      ...pose.parts.neck_mount,
      rotation: thoughtTurn * 1.4,
      x: thoughtTurn * 0.8,
      y: scanLift * -0.6,
    };

    pose.parts.head_bar = {
      ...pose.parts.head_bar,
      rotation: thoughtTurn * 2.2,
      x: thoughtTurn * 2.8,
      y: scanLift * -1.1,
    };

    for (const id of ['left_eye_housing', 'right_eye_housing']) {
      pose.parts[id] = { ...pose.parts[id], rotation: thoughtTurn * 0.6 };
    }

    return pose;
  }
}
