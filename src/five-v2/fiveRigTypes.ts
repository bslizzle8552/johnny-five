import type { CSSProperties } from 'react';

export type FiveV2PartId =
  | 'left_tread_housing'
  | 'right_tread_housing'
  | 'left_tread_belt_00'
  | 'left_tread_belt_01'
  | 'left_tread_belt_02'
  | 'left_tread_belt_03'
  | 'right_tread_belt_00'
  | 'right_tread_belt_01'
  | 'right_tread_belt_02'
  | 'right_tread_belt_03'
  | 'chassis'
  | 'torso'
  | 'neck_mount'
  | 'head_bar'
  | 'left_eye_housing'
  | 'right_eye_housing'
  | 'left_lens'
  | 'right_lens'
  | 'left_eye_glow'
  | 'right_eye_glow'
  | 'left_shoulder_joint'
  | 'left_upper_arm'
  | 'left_lower_arm'
  | 'left_gripper'
  | 'right_shoulder_joint'
  | 'right_upper_arm'
  | 'right_lower_arm'
  | 'right_gripper'
  | 'red_toolbox'
  | 'indicator_light_amber'
  | 'antenna'
  | 'sensor_top_left'
  | 'sensor_top_right'
  | 'small_wires'
  | 'wear_overlay';

export type FiveV2Mode = 'idle' | 'tread-test' | 'roll-test' | 'turn-test';

export type FiveV2Transform = {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
};

export type FiveV2PartDefinition = FiveV2Transform & {
  id: FiveV2PartId;
  filename: `${string}.png`;
  src?: string;
  parentId: FiveV2PartId | null;
  pivotX: number;
  pivotY: number;
  width: number;
  height: number;
  zIndex: number;
  className?: string;
};

export type FiveV2StageConfig = {
  stageWidth: number;
  stageHeight: number;
  floorY: number;
  fiveGroundX: number;
  fiveGroundY: number;
  fiveFacing: 1 | -1;
  baseCenterPoint: { x: number; y: number };
  leftTreadContactPoint: { x: number; y: number };
  rightTreadContactPoint: { x: number; y: number };
};

export type FiveV2Pose = {
  root: {
    groundX: number;
    groundY: number;
    facing: 1 | -1;
  };
  parts: Record<string, FiveV2Transform>;
};

export type FiveV2ControllerContext = {
  timeMs: number;
  deltaMs: number;
  mode: FiveV2Mode;
  stage: FiveV2StageConfig;
};

export type FiveV2Controller = {
  update: (pose: FiveV2Pose, context: FiveV2ControllerContext) => FiveV2Pose;
};

export type FiveV2PartRenderStyle = CSSProperties & {
  '--part-x': string;
  '--part-y': string;
  '--part-width': string;
  '--part-height': string;
  '--part-pivot-x': string;
  '--part-pivot-y': string;
  '--part-z': number;
};
