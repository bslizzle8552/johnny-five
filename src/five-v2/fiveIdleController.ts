import type { FiveV2Controller, FiveV2ControllerContext, FiveV2Pose } from './fiveRigTypes';
import { pulse, wave } from './fiveMotionMath';

export class FiveIdleController implements FiveV2Controller {
  update(pose: FiveV2Pose, context: FiveV2ControllerContext) {
    const suspension = wave(context.timeMs, 7200, 1.4) * 0.9;
    const weightShift = wave(context.timeMs, 9100, 0.2) * 0.18;

    pose.parts.chassis = { ...pose.parts.chassis, y: suspension, rotation: weightShift };
    pose.parts.torso = {
      ...pose.parts.torso,
      y: suspension * 0.55 - 0.4,
      rotation: weightShift * -1.6,
    };
    pose.parts.indicator_light_amber = {
      ...pose.parts.indicator_light_amber,
      opacity: 0.42 + pulse(context.timeMs, 2800) * 0.44,
      scaleX: 0.96 + pulse(context.timeMs, 2800) * 0.08,
      scaleY: 0.96 + pulse(context.timeMs, 2800) * 0.08,
    };

    return pose;
  }
}
