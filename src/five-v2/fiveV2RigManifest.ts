import type { FiveV2PartDefinition, FiveV2PartId, FiveV2Pose } from './fiveRigTypes';
import { makeTransform } from './fiveMotionMath';
import { fiveV2StageConfig } from './fivePivots';

const fiveV2AssetUrls = import.meta.glob<string>('../assets/five/rig/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const requiredFiveV2Filenames = [
  'left-tread-housing.png',
  'right-tread-housing.png',
  'left-tread-belt-loop.png',
  'right-tread-belt-loop.png',
  'chassis-base.png',
  'torso.png',
  'neck-head-mount.png',
  'head-camera-bar.png',
  'left-eye-housing.png',
  'right-eye-housing.png',
  'left-lens.png',
  'right-lens.png',
  'left-eye-highlight-glow.png',
  'right-eye-highlight-glow.png',
  'left-upper-arm.png',
  'left-lower-arm.png',
  'left-gripper-claw.png',
  'right-upper-arm.png',
  'right-lower-arm.png',
  'right-gripper-claw.png',
  'red-shoulder-toolbox.png',
  'amber-indicator-lights.png',
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
  assetFile?: `${string}.png`;
};

function assetUrl(filename: string) {
  return fiveV2AssetUrls[`../assets/five/rig/${filename}`];
}

function definePart(input: RigPartInput): FiveV2PartDefinition & { notes: string } {
  const filename = input.assetFile ?? `${input.id}.png`;

  return {
    ...input,
    filename,
    src: assetUrl(filename),
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
  };
}

export const fiveV2PartManifest = [
  definePart({ id: 'left_tread_belt_00', assetFile: 'left-tread-belt-loop.png', parentId: 'chassis', x: 54, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt left', notes: 'Left tread loop used as simulator belt frame.' }),
  definePart({ id: 'left_tread_belt_01', assetFile: 'left-tread-belt-loop.png', parentId: 'chassis', x: 54, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt left', notes: 'Left tread loop used as simulator belt frame.' }),
  definePart({ id: 'left_tread_belt_02', assetFile: 'left-tread-belt-loop.png', parentId: 'chassis', x: 54, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt left', notes: 'Left tread loop used as simulator belt frame.' }),
  definePart({ id: 'left_tread_belt_03', assetFile: 'left-tread-belt-loop.png', parentId: 'chassis', x: 54, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt left', notes: 'Left tread loop used as simulator belt frame.' }),
  definePart({ id: 'right_tread_belt_00', assetFile: 'right-tread-belt-loop.png', parentId: 'chassis', x: 204, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt right', notes: 'Right tread loop used as simulator belt frame.' }),
  definePart({ id: 'right_tread_belt_01', assetFile: 'right-tread-belt-loop.png', parentId: 'chassis', x: 204, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt right', notes: 'Right tread loop used as simulator belt frame.' }),
  definePart({ id: 'right_tread_belt_02', assetFile: 'right-tread-belt-loop.png', parentId: 'chassis', x: 204, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt right', notes: 'Right tread loop used as simulator belt frame.' }),
  definePart({ id: 'right_tread_belt_03', assetFile: 'right-tread-belt-loop.png', parentId: 'chassis', x: 204, y: 304, width: 142, height: 120, pivotX: 71, pivotY: 104, zIndex: 1, className: 'five-v2-tread-belt right', notes: 'Right tread loop used as simulator belt frame.' }),
  definePart({ id: 'left_tread_housing', assetFile: 'left-tread-housing.png', parentId: 'chassis', x: 48, y: 306, width: 132, height: 128, pivotX: 66, pivotY: 112, zIndex: 3, className: 'five-v2-tread-housing', notes: 'Left tread housing from existing rig kit.' }),
  definePart({ id: 'right_tread_housing', assetFile: 'right-tread-housing.png', parentId: 'chassis', x: 210, y: 306, width: 132, height: 135, pivotX: 66, pivotY: 116, zIndex: 3, className: 'five-v2-tread-housing', notes: 'Right tread housing from existing rig kit.' }),
  definePart({ id: 'chassis', assetFile: 'chassis-base.png', parentId: null, x: 78, y: 258, width: 228, height: 152, pivotX: 114, pivotY: 132, zIndex: 5, className: 'five-v2-chassis', notes: 'Central base chassis from existing rig kit.' }),
  definePart({ id: 'torso', assetFile: 'torso.png', parentId: 'chassis', x: 118, y: 118, width: 162, height: 182, pivotX: 81, pivotY: 170, zIndex: 8, className: 'five-v2-torso', notes: 'Torso from existing rig kit.' }),
  definePart({ id: 'neck_mount', assetFile: 'neck-head-mount.png', parentId: 'torso', x: 154, y: 82, width: 76, height: 62, pivotX: 38, pivotY: 56, zIndex: 9, className: 'five-v2-neck', notes: 'Neck mount from existing rig kit.' }),
  definePart({ id: 'head_bar', assetFile: 'head-camera-bar.png', parentId: 'neck_mount', x: 56, y: 30, width: 244, height: 134, pivotX: 122, pivotY: 112, zIndex: 12, className: 'five-v2-head', notes: 'Head bar from existing rig kit.' }),
  definePart({ id: 'left_eye_housing', assetFile: 'left-eye-housing.png', parentId: 'head_bar', x: 102, y: 66, width: 78, height: 72, pivotX: 39, pivotY: 36, zIndex: 14, className: 'five-v2-eye-housing', notes: 'Left camera housing from existing rig kit.' }),
  definePart({ id: 'right_eye_housing', assetFile: 'right-eye-housing.png', parentId: 'head_bar', x: 190, y: 66, width: 78, height: 72, pivotX: 39, pivotY: 36, zIndex: 14, className: 'five-v2-eye-housing', notes: 'Right camera housing from existing rig kit.' }),
  definePart({ id: 'left_lens', assetFile: 'left-lens.png', parentId: 'left_eye_housing', x: 118, y: 82, width: 42, height: 45, pivotX: 21, pivotY: 22, zIndex: 15, className: 'five-v2-lens', notes: 'Left lens from existing rig kit.' }),
  definePart({ id: 'right_lens', assetFile: 'right-lens.png', parentId: 'right_eye_housing', x: 206, y: 82, width: 42, height: 45, pivotX: 21, pivotY: 22, zIndex: 15, className: 'five-v2-lens', notes: 'Right lens from existing rig kit.' }),
  definePart({ id: 'left_eye_glow', assetFile: 'left-eye-highlight-glow.png', parentId: 'left_lens', x: 115, y: 80, width: 48, height: 48, pivotX: 24, pivotY: 24, zIndex: 16, className: 'five-v2-eye-glow', notes: 'Left glow from existing rig kit.' }),
  definePart({ id: 'right_eye_glow', assetFile: 'right-eye-highlight-glow.png', parentId: 'right_lens', x: 203, y: 80, width: 48, height: 48, pivotX: 24, pivotY: 24, zIndex: 16, className: 'five-v2-eye-glow', notes: 'Right glow from existing rig kit.' }),
  definePart({ id: 'left_shoulder_joint', assetFile: 'left-upper-arm.png', parentId: 'torso', x: 84, y: 176, width: 56, height: 72, pivotX: 45, pivotY: 28, zIndex: 11, className: 'five-v2-arm', notes: 'Temporary shoulder visual until a dedicated socket asset exists.' }),
  definePart({ id: 'left_upper_arm', assetFile: 'left-upper-arm.png', parentId: 'left_shoulder_joint', x: 52, y: 204, width: 58, height: 88, pivotX: 46, pivotY: 18, zIndex: 10, className: 'five-v2-arm', notes: 'Left upper arm from existing rig kit.' }),
  definePart({ id: 'left_lower_arm', assetFile: 'left-lower-arm.png', parentId: 'left_upper_arm', x: 38, y: 270, width: 58, height: 88, pivotX: 44, pivotY: 16, zIndex: 10, className: 'five-v2-arm', notes: 'Left lower arm from existing rig kit.' }),
  definePart({ id: 'left_gripper', assetFile: 'left-gripper-claw.png', parentId: 'left_lower_arm', x: 22, y: 326, width: 72, height: 72, pivotX: 54, pivotY: 20, zIndex: 11, className: 'five-v2-arm', notes: 'Left gripper from existing rig kit.' }),
  definePart({ id: 'right_shoulder_joint', assetFile: 'right-upper-arm.png', parentId: 'torso', x: 262, y: 176, width: 64, height: 72, pivotX: 19, pivotY: 28, zIndex: 11, className: 'five-v2-arm', notes: 'Temporary shoulder visual until a dedicated socket asset exists.' }),
  definePart({ id: 'right_upper_arm', assetFile: 'right-upper-arm.png', parentId: 'right_shoulder_joint', x: 300, y: 204, width: 58, height: 88, pivotX: 12, pivotY: 18, zIndex: 10, className: 'five-v2-arm', notes: 'Right upper arm from existing rig kit.' }),
  definePart({ id: 'right_lower_arm', assetFile: 'right-lower-arm.png', parentId: 'right_upper_arm', x: 314, y: 270, width: 58, height: 88, pivotX: 10, pivotY: 16, zIndex: 10, className: 'five-v2-arm', notes: 'Right lower arm from existing rig kit.' }),
  definePart({ id: 'right_gripper', assetFile: 'right-gripper-claw.png', parentId: 'right_lower_arm', x: 328, y: 326, width: 72, height: 72, pivotX: 18, pivotY: 20, zIndex: 11, className: 'five-v2-arm', notes: 'Right gripper from existing rig kit.' }),
  definePart({ id: 'red_toolbox', assetFile: 'red-shoulder-toolbox.png', parentId: 'torso', x: 246, y: 126, width: 108, height: 82, pivotX: 28, pivotY: 60, zIndex: 13, className: 'five-v2-toolbox', notes: 'Red toolbox from existing rig kit.' }),
  definePart({ id: 'indicator_light_amber', assetFile: 'amber-indicator-lights.png', parentId: 'torso', x: 178, y: 236, width: 38, height: 52, pivotX: 19, pivotY: 26, zIndex: 17, className: 'five-v2-indicator', notes: 'Amber indicator from existing rig kit.' }),
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
