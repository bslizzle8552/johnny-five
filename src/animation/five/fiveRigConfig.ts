import type { FivePartDefinition, FiveStageConfig } from './fiveRigTypes';

import leftTreadHousing from '../../assets/five/rig/left-tread-housing.png';
import rightTreadHousing from '../../assets/five/rig/right-tread-housing.png';
import leftTreadBeltLoop from '../../assets/five/rig/left-tread-belt-loop.png';
import rightTreadBeltLoop from '../../assets/five/rig/right-tread-belt-loop.png';
import chassisBase from '../../assets/five/rig/chassis-base.png';
import torso from '../../assets/five/rig/torso.png';
import neckHeadMount from '../../assets/five/rig/neck-head-mount.png';
import headCameraBar from '../../assets/five/rig/head-camera-bar.png';
import leftEyeHousing from '../../assets/five/rig/left-eye-housing.png';
import rightEyeHousing from '../../assets/five/rig/right-eye-housing.png';
import leftLens from '../../assets/five/rig/left-lens.png';
import rightLens from '../../assets/five/rig/right-lens.png';
import leftEyeGlow from '../../assets/five/rig/left-eye-highlight-glow.png';
import rightEyeGlow from '../../assets/five/rig/right-eye-highlight-glow.png';
import leftUpperArm from '../../assets/five/rig/left-upper-arm.png';
import leftLowerArm from '../../assets/five/rig/left-lower-arm.png';
import leftClaw from '../../assets/five/rig/left-gripper-claw.png';
import rightUpperArm from '../../assets/five/rig/right-upper-arm.png';
import rightLowerArm from '../../assets/five/rig/right-lower-arm.png';
import rightClaw from '../../assets/five/rig/right-gripper-claw.png';
import redToolbox from '../../assets/five/rig/red-shoulder-toolbox.png';
import amberLights from '../../assets/five/rig/amber-indicator-lights.png';
import sensors from '../../assets/five/rig/small-sensors-antenna.png';

export const fiveStageConfig: FiveStageConfig = {
  stageWidth: 1024,
  stageHeight: 576,
  floorY: 462,
  five: {
    rigWidth: 300,
    rigHeight: 450,
    groundLocalX: 150,
    groundLocalY: 404,
    baseWidth: 238,
    treadContactLeft: -92,
    treadContactRight: 103,
  },
  charger: {
    dockTargetX: 226,
    dockTargetY: 462,
    padWidth: 192,
  },
};

const part = (
  id: FivePartDefinition['id'],
  src: string,
  x: number,
  y: number,
  width: number,
  height: number,
  pivotX: number,
  pivotY: number,
  z: number,
  className?: string,
): FivePartDefinition => ({ id, src, x, y, width, height, pivotX, pivotY, z, className });

export const fiveRigParts: FivePartDefinition[] = [
  part('right-tread-belt-loop', rightTreadBeltLoop, 156, 296, 126, 86, 63, 70, 1, 'belt belt-right'),
  part('left-tread-belt-loop', leftTreadBeltLoop, 35, 303, 118, 78, 59, 64, 2, 'belt belt-left'),
  part('right-tread-housing', rightTreadHousing, 152, 289, 126, 111, 63, 92, 3, 'tread tread-right'),
  part('left-tread-housing', leftTreadHousing, 35, 296, 96, 102, 50, 88, 4, 'tread tread-left'),
  part('chassis-base', chassisBase, 65, 255, 155, 123, 78, 116, 6, 'chassis'),
  part('torso', torso, 86, 168, 129, 122, 64, 116, 8, 'torso'),
  part('neck-head-mount', neckHeadMount, 124, 124, 59, 103, 30, 99, 9, 'neck'),
  part('left-upper-arm', leftUpperArm, 69, 214, 38, 67, 30, 7, 10, 'arm left-arm upper-arm'),
  part('left-lower-arm', leftLowerArm, 27, 209, 57, 62, 48, 35, 11, 'arm left-arm lower-arm'),
  part('left-gripper-claw', leftClaw, 12, 207, 38, 45, 27, 30, 12, 'arm left-arm claw'),
  part('right-upper-arm', rightUpperArm, 191, 211, 48, 84, 13, 10, 10, 'arm right-arm upper-arm'),
  part('right-lower-arm', rightLowerArm, 168, 257, 45, 73, 27, 14, 11, 'arm right-arm lower-arm'),
  part('right-gripper-claw', rightClaw, 172, 286, 34, 54, 15, 7, 12, 'arm right-arm claw'),
  part('red-shoulder-toolbox', redToolbox, 190, 147, 89, 101, 18, 73, 13, 'toolbox'),
  part('small-sensors-antenna', sensors, 63, 53, 142, 35, 71, 31, 14, 'sensors'),
  part('head-camera-bar', headCameraBar, 60, 51, 161, 101, 82, 84, 15, 'head'),
  part('left-eye-housing', leftEyeHousing, 69, 86, 57, 58, 29, 30, 16, 'eye eye-left'),
  part('right-eye-housing', rightEyeHousing, 128, 73, 63, 63, 32, 32, 17, 'eye eye-right'),
  part('left-lens', leftLens, 86, 101, 20, 14, 10, 7, 18, 'lens lens-left'),
  part('right-lens', rightLens, 147, 89, 22, 15, 11, 8, 18, 'lens lens-right'),
  part('left-eye-highlight-glow', leftEyeGlow, 73, 91, 39, 26, 20, 13, 19, 'glow eye-glow-left'),
  part('right-eye-highlight-glow', rightEyeGlow, 133, 79, 42, 28, 21, 14, 19, 'glow eye-glow-right'),
  part('amber-indicator-lights', amberLights, 97, 211, 66, 73, 33, 36, 20, 'indicator-lights'),
];
