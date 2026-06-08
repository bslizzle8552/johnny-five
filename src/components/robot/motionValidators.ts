import * as THREE from 'three';
import { referenceMotionLibrary } from './referenceMotionLibrary';

export type Axis = 'x' | 'y' | 'z';
export type BoneRotation = Record<Axis, number>;
export type PoseRotations = Record<string, BoneRotation>;
export type BoneMap = Record<string, THREE.Bone>;

export type PropState = {
  held: boolean;
  grab?: number;
  x: number;
  y: number;
  z: number;
};

export type MotionValidationContext = {
  label: string;
  pose: PoseRotations;
  bones: BoneMap;
  modelYaw: number;
  prop: PropState;
  propPosition: THREE.Vector3 | null;
  chairYaw: number;
  propReachYaw: number;
};

export type MotionValidationResult = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  principleId: string;
};

export type MotionJudgement = {
  passed: boolean;
  label: string;
  results: MotionValidationResult[];
};

const radSafeYawDelta = 35;

function degDistance(a: number, b: number) {
  const delta = ((((a - b) % 360) + 540) % 360) - 180;
  return Math.abs(delta);
}

function boneWorldPosition(bones: BoneMap, name: string) {
  const bone = bones[name];
  if (!bone) {
    return null;
  }

  const position = new THREE.Vector3();
  bone.getWorldPosition(position);
  return position;
}

function result(id: string, label: string, passed: boolean, detail: string, principleId: string): MotionValidationResult {
  return { id, label, passed, detail, principleId };
}

export function validateMotionFrame(context: MotionValidationContext): MotionJudgement {
  const lowerLabel = context.label.toLowerCase();
  const results: MotionValidationResult[] = [];
  const leftKnee = boneWorldPosition(context.bones, 'L_Calf');
  const rightKnee = boneWorldPosition(context.bones, 'R_Calf');
  const leftFoot = boneWorldPosition(context.bones, 'L_Foot');
  const rightFoot = boneWorldPosition(context.bones, 'R_Foot');
  const rightHand = boneWorldPosition(context.bones, 'R_Hand');
  const leftCalf = context.pose.L_Calf?.x ?? 0;
  const rightCalf = context.pose.R_Calf?.x ?? 0;
  const leftFootPitch = context.pose.L_Foot?.x ?? 0;
  const rightFootPitch = context.pose.R_Foot?.x ?? 0;
  const isSitting = lowerLabel.includes('sitting') || lowerLabel.includes('lowering');
  const isChair = isSitting || lowerLabel.includes('turning before sitting');
  const isReach = lowerLabel.includes('gripping') || lowerLabel.includes('inspecting') || lowerLabel.includes('putting the part');
  const isWalk = lowerLabel.includes('wandering') || lowerLabel.includes('approaching') || lowerLabel.includes('settling');

  results.push(result(
    'knee-bend-direction',
    'Knees bend forward',
    leftCalf <= 0.5 && rightCalf <= 0.5,
    `L calf ${leftCalf.toFixed(1)}°, R calf ${rightCalf.toFixed(1)}°`,
    'humanoid-sit-knees-forward',
  ));

  if (isSitting && leftKnee && rightKnee && leftFoot && rightFoot) {
    const leftOk = leftFoot.y <= leftKnee.y + 0.04;
    const rightOk = rightFoot.y <= rightKnee.y + 0.04;
    results.push(result(
      'feet-below-knees',
      'Feet stay below knees while sitting',
      leftOk && rightOk,
      `L foot/knee ${leftFoot.y.toFixed(2)}/${leftKnee.y.toFixed(2)}, R ${rightFoot.y.toFixed(2)}/${rightKnee.y.toFixed(2)}`,
      'humanoid-sit-knees-forward',
    ));
  }

  if (context.prop.held && rightHand && context.propPosition) {
    const distance = rightHand.distanceTo(context.propPosition);
    results.push(result(
      'held-object-hand-distance',
      'Held object is in the hand',
      distance <= 0.16,
      `hand/object distance ${distance.toFixed(2)}m`,
      'manipulation-contact-before-ownership',
    ));
  }

  if (isChair) {
    const delta = degDistance(context.modelYaw, context.chairYaw);
    results.push(result(
      'chair-facing-yaw',
      'Body faces chair before sitting',
      delta <= radSafeYawDelta,
      `yaw delta ${delta.toFixed(1)}°`,
      'body-faces-affordance',
    ));
  }

  if (isReach) {
    const delta = degDistance(context.modelYaw, context.propReachYaw);
    results.push(result(
      'reach-facing-yaw',
      'Body faces object while reaching',
      delta <= 48,
      `yaw delta ${delta.toFixed(1)}°`,
      'body-faces-affordance',
    ));
  }

  if (isWalk) {
    const hasFootCounter = Math.max(leftFootPitch, rightFootPitch) > 4;
    results.push(result(
      'walk-step-distance',
      'Walk has planted foot counter-rotation',
      hasFootCounter,
      `foot pitch L ${leftFootPitch.toFixed(1)}°, R ${rightFootPitch.toFixed(1)}°`,
      'planted-foot-supports-travel',
    ));
  }

  const passed = results.every((item) => item.passed);
  return {
    passed,
    label: passed ? 'Motion judge: passing' : 'Motion judge: blocked bad motion',
    results,
  };
}

export function getReferencePrinciple(principleId: string) {
  return referenceMotionLibrary.find((principle) => principle.id === principleId);
}
