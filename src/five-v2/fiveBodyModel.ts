export type FiveActuatorKind = 'servo' | 'continuous-servo' | 'motor' | 'light' | 'sensor' | 'visual';

export type FiveAxis = 'rotation' | 'translation' | 'brightness' | 'speed';

export type FiveBodyPartId =
  | 'base'
  | 'leftTread'
  | 'rightTread'
  | 'torso'
  | 'neck'
  | 'head'
  | 'leftEye'
  | 'rightEye'
  | 'leftShoulder'
  | 'leftElbow'
  | 'leftWrist'
  | 'leftGripper'
  | 'rightShoulder'
  | 'rightElbow'
  | 'rightWrist'
  | 'rightGripper'
  | 'statusLight';

export type FiveActuatorId =
  | 'leftTreadDrive'
  | 'rightTreadDrive'
  | 'torsoLean'
  | 'neckYaw'
  | 'headPitch'
  | 'leftEyePan'
  | 'rightEyePan'
  | 'leftShoulderLift'
  | 'leftElbowBend'
  | 'leftWristRotate'
  | 'leftGripperOpen'
  | 'rightShoulderLift'
  | 'rightElbowBend'
  | 'rightWristRotate'
  | 'rightGripperOpen'
  | 'statusLightGlow';

export type FiveActuatorDefinition = {
  id: FiveActuatorId;
  label: string;
  partId: FiveBodyPartId;
  kind: FiveActuatorKind;
  axis: FiveAxis;
  units: 'degrees' | 'percent' | 'pixels';
  neutral: number;
  safeMin: number;
  safeMax: number;
  maxChangePerSecond: number;
  hardware: {
    enabled: boolean;
    boardPin: string | null;
    notes: string;
  };
};

export type FiveBodyCommand = {
  actuatorId: FiveActuatorId;
  value: number;
  reason: string;
};

export const fiveActuatorDefinitions: FiveActuatorDefinition[] = [
  {
    id: 'leftTreadDrive',
    label: 'Left tread drive',
    partId: 'leftTread',
    kind: 'continuous-servo',
    axis: 'speed',
    units: 'percent',
    neutral: 0,
    safeMin: -70,
    safeMax: 70,
    maxChangePerSecond: 120,
    hardware: { enabled: false, boardPin: null, notes: 'Map to a real drive pin after the chassis electronics are chosen.' },
  },
  {
    id: 'rightTreadDrive',
    label: 'Right tread drive',
    partId: 'rightTread',
    kind: 'continuous-servo',
    axis: 'speed',
    units: 'percent',
    neutral: 0,
    safeMin: -70,
    safeMax: 70,
    maxChangePerSecond: 120,
    hardware: { enabled: false, boardPin: null, notes: 'Positive value should match left tread forward after calibration.' },
  },
  {
    id: 'torsoLean',
    label: 'Torso lean',
    partId: 'torso',
    kind: 'servo',
    axis: 'rotation',
    units: 'degrees',
    neutral: 0,
    safeMin: -10,
    safeMax: 10,
    maxChangePerSecond: 25,
    hardware: { enabled: false, boardPin: null, notes: 'Optional. Leave visual-only until the torso has an actual servo.' },
  },
  {
    id: 'neckYaw',
    label: 'Neck turn',
    partId: 'neck',
    kind: 'servo',
    axis: 'rotation',
    units: 'degrees',
    neutral: 0,
    safeMin: -45,
    safeMax: 45,
    maxChangePerSecond: 90,
    hardware: { enabled: false, boardPin: null, notes: 'Primary head left/right control.' },
  },
  {
    id: 'headPitch',
    label: 'Head tilt',
    partId: 'head',
    kind: 'servo',
    axis: 'rotation',
    units: 'degrees',
    neutral: 0,
    safeMin: -20,
    safeMax: 20,
    maxChangePerSecond: 60,
    hardware: { enabled: false, boardPin: null, notes: 'Optional up/down tilt if the head mount supports it.' },
  },
  {
    id: 'leftEyePan',
    label: 'Left eye pan',
    partId: 'leftEye',
    kind: 'visual',
    axis: 'translation',
    units: 'pixels',
    neutral: 0,
    safeMin: -5,
    safeMax: 5,
    maxChangePerSecond: 30,
    hardware: { enabled: false, boardPin: null, notes: 'Current puppet-only lens movement.' },
  },
  {
    id: 'rightEyePan',
    label: 'Right eye pan',
    partId: 'rightEye',
    kind: 'visual',
    axis: 'translation',
    units: 'pixels',
    neutral: 0,
    safeMin: -5,
    safeMax: 5,
    maxChangePerSecond: 30,
    hardware: { enabled: false, boardPin: null, notes: 'Current puppet-only lens movement.' },
  },
  {
    id: 'leftShoulderLift',
    label: 'Left shoulder lift',
    partId: 'leftShoulder',
    kind: 'servo',
    axis: 'rotation',
    units: 'degrees',
    neutral: 0,
    safeMin: -35,
    safeMax: 55,
    maxChangePerSecond: 70,
    hardware: { enabled: false, boardPin: null, notes: 'Needs real servo direction and range calibration.' },
  },
  {
    id: 'leftElbowBend',
    label: 'Left elbow bend',
    partId: 'leftElbow',
    kind: 'servo',
    axis: 'rotation',
    units: 'degrees',
    neutral: 0,
    safeMin: -55,
    safeMax: 70,
    maxChangePerSecond: 80,
    hardware: { enabled: false, boardPin: null, notes: 'Needs real elbow travel measured before hardware output.' },
  },
  {
    id: 'leftWristRotate',
    label: 'Left wrist rotate',
    partId: 'leftWrist',
    kind: 'servo',
    axis: 'rotation',
    units: 'degrees',
    neutral: 0,
    safeMin: -35,
    safeMax: 35,
    maxChangePerSecond: 90,
    hardware: { enabled: false, boardPin: null, notes: 'Optional wrist control.' },
  },
  {
    id: 'leftGripperOpen',
    label: 'Left gripper open',
    partId: 'leftGripper',
    kind: 'servo',
    axis: 'rotation',
    units: 'percent',
    neutral: 40,
    safeMin: 0,
    safeMax: 80,
    maxChangePerSecond: 120,
    hardware: { enabled: false, boardPin: null, notes: 'Percent open, not degrees, until gripper mechanics are known.' },
  },
  {
    id: 'rightShoulderLift',
    label: 'Right shoulder lift',
    partId: 'rightShoulder',
    kind: 'servo',
    axis: 'rotation',
    units: 'degrees',
    neutral: 0,
    safeMin: -55,
    safeMax: 35,
    maxChangePerSecond: 70,
    hardware: { enabled: false, boardPin: null, notes: 'Mirrored shoulder, calibrated separately from the left side.' },
  },
  {
    id: 'rightElbowBend',
    label: 'Right elbow bend',
    partId: 'rightElbow',
    kind: 'servo',
    axis: 'rotation',
    units: 'degrees',
    neutral: 0,
    safeMin: -70,
    safeMax: 55,
    maxChangePerSecond: 80,
    hardware: { enabled: false, boardPin: null, notes: 'Mirrored elbow, calibrated separately from the left side.' },
  },
  {
    id: 'rightWristRotate',
    label: 'Right wrist rotate',
    partId: 'rightWrist',
    kind: 'servo',
    axis: 'rotation',
    units: 'degrees',
    neutral: 0,
    safeMin: -35,
    safeMax: 35,
    maxChangePerSecond: 90,
    hardware: { enabled: false, boardPin: null, notes: 'Optional wrist control.' },
  },
  {
    id: 'rightGripperOpen',
    label: 'Right gripper open',
    partId: 'rightGripper',
    kind: 'servo',
    axis: 'rotation',
    units: 'percent',
    neutral: 40,
    safeMin: 0,
    safeMax: 80,
    maxChangePerSecond: 120,
    hardware: { enabled: false, boardPin: null, notes: 'Percent open, not degrees, until gripper mechanics are known.' },
  },
  {
    id: 'statusLightGlow',
    label: 'Status light glow',
    partId: 'statusLight',
    kind: 'light',
    axis: 'brightness',
    units: 'percent',
    neutral: 35,
    safeMin: 0,
    safeMax: 100,
    maxChangePerSecond: 160,
    hardware: { enabled: false, boardPin: null, notes: 'Could map to PWM LED brightness later.' },
  },
];

export const fiveActuatorById = Object.fromEntries(
  fiveActuatorDefinitions.map((definition) => [definition.id, definition]),
) as Record<FiveActuatorId, FiveActuatorDefinition>;

export function clampFiveCommand(command: FiveBodyCommand): FiveBodyCommand {
  const actuator = fiveActuatorById[command.actuatorId];

  return {
    ...command,
    value: Math.min(actuator.safeMax, Math.max(actuator.safeMin, command.value)),
  };
}

export function createNeutralFiveBodyCommands(reason = 'neutral posture'): FiveBodyCommand[] {
  return fiveActuatorDefinitions.map((actuator) => ({
    actuatorId: actuator.id,
    value: actuator.neutral,
    reason,
  }));
}
