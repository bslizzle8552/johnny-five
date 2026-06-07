import type { FiveV2PartDefinition, FiveV2PartId, FiveV2Pose } from './fiveRigTypes';
import { makeTransform } from './fiveMotionMath';
import { fiveV2StageConfig } from './fivePivots';

const fiveV2AssetUrls = import.meta.glob<string>('../assets/five-v2/parts/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const requiredFiveV2Filenames = [
  'left_tread_housing.png',
  'right_tread_housing.png',
  'left_tread_belt_00.png',
  'left_tread_belt_01.png',
  'left_tread_belt_02.png',
  'left_tread_belt_03.png',
  'right_tread_belt_00.png',
  'right_tread_belt_01.png',
  'right_tread_belt_02.png',
  'right_tread_belt_03.png',
  'chassis.png',
  'torso.png',
  'neck_mount.png',
  'head_bar.png',
  'left_eye_housing.png',
  'right_eye_housing.png',
  'left_lens.png',
  'right_lens.png',
  'left_eye_glow.png',
  'right_eye_glow.png',
  'left_shoulder_joint.png',
  'left_upper_arm.png',
  'left_lower_arm.png',
  'left_gripper.png',
  'right_shoulder_joint.png',
  'right_upper_arm.png',
  'right_lower_arm.png',
  'right_gripper.png',
  'red_toolbox.png',
  'indicator_light_amber.png',
] as const;

type RigPartInput = {
  id: FiveV2PartId;
  parentId: FiveV2PartId | null;
  x: number;
  y: number;
  width: number;
  height: number;
  pivotX: number;
  pivotY: number;
  zIndex: number;
  notes: string;
  className?: string;
};

function assetUrl(filename: string) {
  return fiveV2AssetUrls[`../assets/five-v2/parts/${filename}`];
}

function definePart(input: RigPartInput): FiveV2PartDefinition & { notes: string } {
  return {
    ...input,
    filename: `${input.id}.png`,
    src: assetUrl(`${input.id}.png`),
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
  };
}

export const fiveV2PartManifest = [
  definePart({ id: 'left_tread_belt_00', parentId: 'chassis', x: 54, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt left', notes: 'First left tread frame from generated tread sheet.' }),
  definePart({ id: 'left_tread_belt_01', parentId: 'chassis', x: 54, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt left', notes: 'Second left tread frame, pattern advanced.' }),
  definePart({ id: 'left_tread_belt_02', parentId: 'chassis', x: 54, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt left', notes: 'Third left tread frame, pattern advanced.' }),
  definePart({ id: 'left_tread_belt_03', parentId: 'chassis', x: 54, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt left', notes: 'Fourth left tread frame, pattern advanced.' }),
  definePart({ id: 'right_tread_belt_00', parentId: 'chassis', x: 204, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt right', notes: 'First right tread frame from generated tread sheet.' }),
  definePart({ id: 'right_tread_belt_01', parentId: 'chassis', x: 204, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt right', notes: 'Second right tread frame, pattern advanced.' }),
  definePart({ id: 'right_tread_belt_02', parentId: 'chassis', x: 204, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt right', notes: 'Third right tread frame, pattern advanced.' }),
  definePart({ id: 'right_tread_belt_03', parentId: 'chassis', x: 204, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt right', notes: 'Fourth right tread frame, pattern advanced.' }),
  definePart({ id: 'left_tread_housing', parentId: 'chassis', x: 48, y: 306, width: 132, height: 128, pivotX: 66, pivotY: 112, zIndex: 3, className: 'five-v2-tread-housing', notes: 'Left generated tread housing crop.' }),
  definePart({ id: 'right_tread_housing', parentId: 'chassis', x: 210, y: 306, width: 132, height: 135, pivotX: 66, pivotY: 116, zIndex: 3, className: 'five-v2-tread-housing', notes: 'Right generated tread housing crop.' }),
  definePart({ id: 'chassis', parentId: null, x: 78, y: 258, width: 228, height: 152, pivotX: 114, pivotY: 132, zIndex: 5, className: 'five-v2-chassis', notes: 'Central base chassis from puppet sheet.' }),
  definePart({ id: 'torso', parentId: 'chassis', x: 118, y: 118, width: 162, height: 182, pivotX: 81, pivotY: 170, zIndex: 8, className: 'five-v2-torso', notes: 'Compact industrial torso crop.' }),
  definePart({ id: 'neck_mount', parentId: 'torso', x: 154, y: 82, width: 76, height: 62, pivotX: 38, pivotY: 56, zIndex: 9, className: 'five-v2-neck', notes: 'Neck mount and rotating collar.' }),
  definePart({ id: 'head_bar', parentId: 'neck_mount', x: 56, y: 30, width: 244, height: 134, pivotX: 122, pivotY: 112, zIndex: 12, className: 'five-v2-head', notes: 'Twin camera-eye head bar.' }),
  definePart({ id: 'left_eye_housing', parentId: 'head_bar', x: 102, y: 66, width: 78, height: 72, pivotX: 39, pivotY: 36, zIndex: 14, className: 'five-v2-eye-housing', notes: 'Left camera housing.' }),
  definePart({ id: 'right_eye_housing', parentId: 'head_bar', x: 190, y: 66, width: 78, height: 72, pivotX: 39, pivotY: 36, zIndex: 14, className: 'five-v2-eye-housing', notes: 'Right camera housing.' }),
  definePart({ id: 'left_lens', parentId: 'left_eye_housing', x: 118, y: 82, width: 42, height: 45, pivotX: 21, pivotY: 22, zIndex: 15, className: 'five-v2-lens', notes: 'Left glass lens layer.' }),
  definePart({ id: 'right_lens', parentId: 'right_eye_housing', x: 206, y: 82, width: 42, height: 45, pivotX: 21, pivotY: 22, zIndex: 15, className: 'five-v2-lens', notes: 'Right glass lens layer.' }),
  definePart({ id: 'left_eye_glow', parentId: 'left_lens', x: 115, y: 80, width: 48, height: 48, pivotX: 24, pivotY: 24, zIndex: 16, className: 'five-v2-eye-glow', notes: 'Left amber glow overlay.' }),
  definePart({ id: 'right_eye_glow', parentId: 'right_lens', x: 203, y: 80, width: 48, height: 48, pivotX: 24, pivotY: 24, zIndex: 16, className: 'five-v2-eye-glow', notes: 'Right amber glow overlay.' }),
  definePart({ id: 'left_shoulder_joint', parentId: 'torso', x: 84, y: 176, width: 56, height: 72, pivotX: 45, pivotY: 28, zIndex: 11, className: 'five-v2-arm', notes: 'Left round shoulder joint.' }),
  definePart({ id: 'left_upper_arm', parentId: 'left_shoulder_joint', x: 52, y: 204, width: 58, height: 88, pivotX: 46, pivotY: 18, zIndex: 10, className: 'five-v2-arm', notes: 'Left upper arm segment.' }),
  definePart({ id: 'left_lower_arm', parentId: 'left_upper_arm', x: 38, y: 270, width: 58, height: 88, pivotX: 44, pivotY: 16, zIndex: 10, className: 'five-v2-arm', notes: 'Left lower arm segment.' }),
  definePart({ id: 'left_gripper', parentId: 'left_lower_arm', x: 22, y: 326, width: 72, height: 72, pivotX: 54, pivotY: 20, zIndex: 11, className: 'five-v2-arm', notes: 'Left claw gripper.' }),
  definePart({ id: 'right_shoulder_joint', parentId: 'torso', x: 262, y: 176, width: 64, height: 72, pivotX: 19, pivotY: 28, zIndex: 11, className: 'five-v2-arm', notes: 'Right round shoulder joint.' }),
  definePart({ id: 'right_upper_arm', parentId: 'right_shoulder_joint', x: 300, y: 204, width: 58, height: 88, pivotX: 12, pivotY: 18, zIndex: 10, className: 'five-v2-arm', notes: 'Right upper arm segment.' }),
  definePart({ id: 'right_lower_arm', parentId: 'right_upper_arm', x: 314, y: 270, width: 58, height: 88, pivotX: 10, pivotY: 16, zIndex: 10, className: 'five-v2-arm', notes: 'Right lower arm segment.' }),
  definePart({ id: 'right_gripper', parentId: 'right_lower_arm', x: 328, y: 326, width: 72, height: 72, pivotX: 18, pivotY: 20, zIndex: 11, className: 'five-v2-arm', notes: 'Right claw gripper.' }),
  definePart({ id: 'red_toolbox', parentId: 'torso', x: 246, y: 126, width: 108, height: 82, pivotX: 28, pivotY: 60, zIndex: 13, className: 'five-v2-toolbox', notes: 'Red shoulder toolbox crop.' }),
  definePart({ id: 'indicator_light_amber', parentId: 'torso', x: 178, y: 236, width: 38, height: 52, pivotX: 19, pivotY: 26, zIndex: 17, className: 'five-v2-indicator', notes: 'Amber indicator light crop.' }),
] satisfies Array<FiveV2PartDefinition & { notes: string }>;

export const missingFiveV2Assets = requiredFiveV2Filenames.filter((filename) => !assetUrl(filename));
export const hasCompleteFiveV2AssetKit = missingFiveV2Assets.length === 0;

export function createFiveV2BasePose(): FiveV2Pose {
  return {
    root: {
      groundX: fiveV2StageConfig.fiveGroundX,
      groundY: fiveV2StageConfig.fiveGroundY,
      facing: fiveV2StageConfig.fiveFacing,
    },
    parts: Object.fromEntries(fiveV2PartManifest.map((item) => [item.id, makeTransform()])),
  };
}
