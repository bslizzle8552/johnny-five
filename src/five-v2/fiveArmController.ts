import type { FiveV2Controller, FiveV2ControllerContext, FiveV2Pose } from './fiveRigTypes';
import { wave } from './fiveMotionMath';

export class FiveArmController implements FiveV2Controller {
  update(pose: FiveV2Pose, context: FiveV2ControllerContext) {
    const leftSettle = wave(context.timeMs, 10400, 0.4);
    const rightSettle = wave(context.timeMs, 11900, 2.3);
    const tinyLag = context.mode === 'roll-test' ? 1.8 : 0;

    pose.parts.left_shoulder_joint = { ...pose.parts.left_shoulder_joint, rotation: leftSettle * 0.5 };
    pose.parts.left_upper_arm = { ...pose.parts.left_upper_arm, rotation: -1.4 + leftSettle * 1.2 - tinyLag };
    pose.parts.left_lower_arm = { ...pose.parts.left_lower_arm, rotation: 1.1 + leftSettle * -0.8 };
    pose.parts.left_gripper = { ...pose.parts.left_gripper, rotation: leftSettle * 0.7 };

    pose.parts.right_shoulder_joint = { ...pose.parts.right_shoulder_joint, rotation: rightSettle * -0.45 };
    pose.parts.right_upper_arm = { ...pose.parts.right_upper_arm, rotation: 1.2 + rightSettle * -1 + tinyLag };
    pose.parts.right_lower_arm = { ...pose.parts.right_lower_arm, rotation: -0.8 + rightSettle * 0.7 };
    pose.parts.right_gripper = { ...pose.parts.right_gripper, rotation: rightSettle * -0.6 };

    return pose;
  }
}
