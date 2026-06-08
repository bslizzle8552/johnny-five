import type { FiveBodyCommand } from './fiveBodyModel';
import type { FiveV2Pose, FiveV2Transform } from './fiveRigTypes';

function withPart(pose: FiveV2Pose, id: string, patch: Partial<FiveV2Transform>) {
  const current = pose.parts[id];
  if (!current) {
    return;
  }

  pose.parts[id] = { ...current, ...patch };
}

function nudgePart(pose: FiveV2Pose, id: string, patch: Partial<FiveV2Transform>) {
  const current = pose.parts[id];
  if (!current) {
    return;
  }

  pose.parts[id] = {
    ...current,
    x: current.x + (patch.x ?? 0),
    y: current.y + (patch.y ?? 0),
    rotation: current.rotation + (patch.rotation ?? 0),
    scaleX: current.scaleX * (patch.scaleX ?? 1),
    scaleY: current.scaleY * (patch.scaleY ?? 1),
    opacity: patch.opacity ?? current.opacity,
  };
}

export function applyFiveBodyCommandsToPose(pose: FiveV2Pose, commands: FiveBodyCommand[]): FiveV2Pose {
  const nextPose: FiveV2Pose = {
    root: { ...pose.root },
    parts: Object.fromEntries(Object.entries(pose.parts).map(([id, transform]) => [id, { ...transform }])),
  };

  for (const command of commands) {
    const value = command.value;

    switch (command.actuatorId) {
      case 'leftTreadDrive':
      case 'rightTreadDrive': {
        const lean = command.actuatorId === 'leftTreadDrive' ? value * 0.008 : value * -0.008;
        nudgePart(nextPose, 'chassis', { rotation: lean });
        break;
      }
      case 'torsoLean':
        nudgePart(nextPose, 'torso', { rotation: value * 0.7 });
        break;
      case 'neckYaw':
        nudgePart(nextPose, 'neck_mount', { rotation: value * 0.28, x: value * 0.04 });
        nudgePart(nextPose, 'head_bar', { rotation: value * 0.22, x: value * 0.08 });
        break;
      case 'headPitch':
        nudgePart(nextPose, 'head_bar', { rotation: value * 0.18, y: value * 0.08 });
        break;
      case 'leftEyePan':
        nudgePart(nextPose, 'left_lens', { x: value });
        nudgePart(nextPose, 'left_eye_glow', { x: value * 0.72 });
        break;
      case 'rightEyePan':
        nudgePart(nextPose, 'right_lens', { x: value });
        nudgePart(nextPose, 'right_eye_glow', { x: value * 0.72 });
        break;
      case 'leftShoulderLift':
        nudgePart(nextPose, 'left_shoulder_joint', { rotation: value * 0.18 });
        nudgePart(nextPose, 'left_upper_arm', { rotation: value * 0.46 });
        break;
      case 'leftElbowBend':
        nudgePart(nextPose, 'left_lower_arm', { rotation: value * 0.42 });
        break;
      case 'leftWristRotate':
        nudgePart(nextPose, 'left_gripper', { rotation: value * 0.38 });
        break;
      case 'leftGripperOpen': {
        const open = 0.86 + value / 500;
        nudgePart(nextPose, 'left_gripper', { scaleX: open, scaleY: open });
        break;
      }
      case 'rightShoulderLift':
        nudgePart(nextPose, 'right_shoulder_joint', { rotation: value * 0.18 });
        nudgePart(nextPose, 'right_upper_arm', { rotation: value * 0.46 });
        break;
      case 'rightElbowBend':
        nudgePart(nextPose, 'right_lower_arm', { rotation: value * 0.42 });
        break;
      case 'rightWristRotate':
        nudgePart(nextPose, 'right_gripper', { rotation: value * 0.38 });
        break;
      case 'rightGripperOpen': {
        const open = 0.86 + value / 500;
        nudgePart(nextPose, 'right_gripper', { scaleX: open, scaleY: open });
        break;
      }
      case 'statusLightGlow':
        withPart(nextPose, 'indicator_light_amber', {
          opacity: Math.max(0.25, value / 100),
          scaleX: 0.94 + value / 900,
          scaleY: 0.94 + value / 900,
        });
        break;
    }
  }

  return nextPose;
}
