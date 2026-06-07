import type { CSSProperties } from 'react';

export type FiveAnimationState =
  | 'Idle'
  | 'LookAround'
  | 'Roll'
  | 'TurnLeft'
  | 'TurnRight'
  | 'Investigate'
  | 'Read'
  | 'Charge'
  | 'Sleep'
  | 'Wake';

export type FiveMotionMode = 'still' | 'roll' | 'slowRoll' | 'turnLeft' | 'turnRight' | 'align' | 'dock' | 'settle';

export type FiveFacing = -1 | 1;

export type FivePartId =
  | 'left-tread-belt-loop'
  | 'right-tread-belt-loop'
  | 'left-tread-housing'
  | 'right-tread-housing'
  | 'chassis-base'
  | 'torso'
  | 'neck-head-mount'
  | 'head-camera-bar'
  | 'left-eye-housing'
  | 'right-eye-housing'
  | 'left-lens'
  | 'right-lens'
  | 'left-eye-highlight-glow'
  | 'right-eye-highlight-glow'
  | 'left-shoulder-joint'
  | 'left-upper-arm'
  | 'left-lower-arm'
  | 'left-gripper-claw'
  | 'right-shoulder-joint'
  | 'right-upper-arm'
  | 'right-lower-arm'
  | 'right-gripper-claw'
  | 'red-shoulder-toolbox'
  | 'amber-indicator-lights'
  | 'small-sensors-antenna';

export type FivePartDefinition = {
  id: FivePartId;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pivotX: number;
  pivotY: number;
  z: number;
  className?: string;
  style?: CSSProperties;
};

export type FiveStageConfig = {
  stageWidth: number;
  stageHeight: number;
  floorY: number;
  five: {
    rigWidth: number;
    rigHeight: number;
    groundLocalX: number;
    groundLocalY: number;
    baseWidth: number;
    treadContactLeft: number;
    treadContactRight: number;
  };
  charger: {
    dockTargetX: number;
    dockTargetY: number;
    padWidth: number;
  };
};

export type FiveSceneMoment = {
  id: string;
  state: FiveAnimationState;
  motion: FiveMotionMode;
  groundX: number;
  groundY: number;
  facing: FiveFacing;
  durationMs: number;
  travelMs?: number;
  look: {
    x: number;
    y: number;
  };
  speech?: string;
  speechDelayMs?: number;
};

export type FiveControllerState = {
  moment: FiveSceneMoment;
  speech: string | null;
  isBlinking: boolean;
};
