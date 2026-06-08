import { clamp } from './fiveMotionMath';
import type { FiveActuatorId, FiveBodyCommand } from './fiveBodyModel';
import { clampFiveCommand, createNeutralFiveBodyCommands } from './fiveBodyModel';
import type { FiveIntent } from './fiveIntentTypes';

function command(actuatorId: FiveActuatorId, value: number, reason: string): FiveBodyCommand {
  return clampFiveCommand({ actuatorId, value, reason });
}

function intentStrength(value: number | undefined, fallback: number) {
  return clamp(value ?? fallback, 0, 1);
}

export function computeFiveBodyCommands(intent: FiveIntent): FiveBodyCommand[] {
  if (intent.type === 'rest') {
    const energy = intentStrength(intent.energy, 0.35);

    return [
      ...createNeutralFiveBodyCommands('resting neutral posture'),
      command('torsoLean', -2 * energy, 'small settled body lean'),
      command('statusLightGlow', 25 + energy * 35, 'resting status light'),
    ];
  }

  if (intent.type === 'look') {
    const strength = intentStrength(intent.intensity, 0.7);
    const yawByDirection = {
      center: 0,
      left: -28,
      right: 28,
      up: 0,
      down: 0,
    };
    const pitchByDirection = {
      center: 0,
      left: 0,
      right: 0,
      up: -12,
      down: 12,
    };
    const eyePanByDirection = {
      center: 0,
      left: -4,
      right: 4,
      up: 0,
      down: 0,
    };

    return [
      command('neckYaw', yawByDirection[intent.direction] * strength, `look ${intent.direction}`),
      command('headPitch', pitchByDirection[intent.direction] * strength, `look ${intent.direction}`),
      command('leftEyePan', eyePanByDirection[intent.direction] * strength, `eyes track ${intent.direction}`),
      command('rightEyePan', eyePanByDirection[intent.direction] * strength, `eyes track ${intent.direction}`),
      command('statusLightGlow', 55, 'attentive status light'),
    ];
  }

  if (intent.type === 'roll') {
    const speed = intentStrength(intent.speed, 0.45) * 70;
    const driveByDirection = {
      stop: [0, 0],
      forward: [speed, speed],
      backward: [-speed, -speed],
      'turn-left': [-speed * 0.65, speed * 0.65],
      'turn-right': [speed * 0.65, -speed * 0.65],
    } satisfies Record<typeof intent.direction, [number, number]>;
    const [left, right] = driveByDirection[intent.direction];

    return [
      command('leftTreadDrive', left, `roll ${intent.direction}`),
      command('rightTreadDrive', right, `roll ${intent.direction}`),
      command('torsoLean', intent.direction === 'forward' ? 3 : 0, 'balance while rolling'),
      command('statusLightGlow', intent.direction === 'stop' ? 35 : 70, 'movement status light'),
    ];
  }

  const strength = intentStrength(intent.intensity, 0.65);
  const isLeft = intent.side === 'left';
  const prefix = isLeft ? 'left' : 'right';
  const shoulderId = `${prefix}ShoulderLift` as FiveActuatorId;
  const elbowId = `${prefix}ElbowBend` as FiveActuatorId;
  const wristId = `${prefix}WristRotate` as FiveActuatorId;
  const gripperId = `${prefix}GripperOpen` as FiveActuatorId;
  const sideSign = isLeft ? 1 : -1;

  if (intent.shape === 'point') {
    return [
      command(shoulderId, sideSign * 35 * strength, `${intent.side} point shoulder`),
      command(elbowId, sideSign * -18 * strength, `${intent.side} point elbow`),
      command(wristId, sideSign * 10 * strength, `${intent.side} point wrist`),
      command(gripperId, 18, `${intent.side} pointing gripper`),
      command('statusLightGlow', 60, 'gesture status light'),
    ];
  }

  if (intent.shape === 'wave') {
    return [
      command(shoulderId, sideSign * 42 * strength, `${intent.side} wave shoulder`),
      command(elbowId, sideSign * 42 * strength, `${intent.side} wave elbow`),
      command(wristId, sideSign * 24 * strength, `${intent.side} wave wrist`),
      command(gripperId, 55, `${intent.side} open wave gripper`),
      command('statusLightGlow', 78, 'friendly gesture status light'),
    ];
  }

  if (intent.shape === 'open-hand') {
    return [
      command(shoulderId, sideSign * 16 * strength, `${intent.side} open hand shoulder`),
      command(elbowId, sideSign * 20 * strength, `${intent.side} open hand elbow`),
      command(wristId, 0, `${intent.side} open hand wrist`),
      command(gripperId, 75, `${intent.side} open gripper`),
      command('statusLightGlow', 62, 'open hand status light'),
    ];
  }

  return [
    command(shoulderId, 0, `${intent.side} relaxed shoulder`),
    command(elbowId, 0, `${intent.side} relaxed elbow`),
    command(wristId, 0, `${intent.side} relaxed wrist`),
    command(gripperId, 40, `${intent.side} relaxed gripper`),
    command('statusLightGlow', 38, 'relaxed gesture status light'),
  ];
}
