import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { validateMotionFrame, type MotionJudgement } from './motionValidators';
import { createWorkshopScene, workshopAnchors } from './workshopScene';

type BoneMap = Record<string, THREE.Bone>;
type Axis = 'x' | 'y' | 'z';
type BoneRotation = Record<Axis, number>;
type PoseRotations = Record<string, BoneRotation>;
type AxisLimit = { min: number; max: number };
type BoneLimits = Record<Axis, AxisLimit>;

type BoneProfile = {
  boneName: string;
  region: string;
  side: string;
  center: { x: number; y: number; z: number };
  influence: number;
  limits: BoneLimits;
};

type ProbeState = {
  boneName: string;
  axis: Axis;
};

type AutoTesterState = {
  running: boolean;
  boneName: string;
  axis: Axis;
};

type BrainFrame = {
  label: string;
  modelYaw: number;
  x: number;
  y?: number;
  z: number;
  prop: {
    held: boolean;
    grab?: number;
    x: number;
    y: number;
    z: number;
  };
  rotations: PoseRotations;
};

type SequenceFrame = {
  label: string;
  modelYaw: number;
  z: number;
  rotations: PoseRotations;
};

const tripoSourcePath = '/robot/processed/walking_optimized.glb';
const defaultModelYaw = -90;
const probeAmplitude = 32;
const probeSpeed = 3.4;
const sequenceDuration = 12.5;
const testerSlotSeconds = 1.45;
const axes: Axis[] = ['x', 'y', 'z'];
const lockedLimits: BoneLimits = {
  x: { min: 0, max: 0 },
  y: { min: 0, max: 0 },
  z: { min: 0, max: 0 },
};

const emptyRotation: BoneRotation = { x: 0, y: 0, z: 0 };
const defaultLimits: BoneLimits = {
  x: { min: -35, max: 35 },
  y: { min: -35, max: 35 },
  z: { min: -35, max: 35 },
};

const standingPose: PoseRotations = {
  L_Clavicle: { x: 0, y: -1, z: -8 },
  L_Upperarm: { x: -8, y: -2, z: -62 },
  L_Forearm: { x: 12, y: 0, z: 1 },
  L_Hand: { x: 0, y: 0, z: -2 },
  R_Clavicle: { x: 0, y: 1, z: 8 },
  R_Upperarm: { x: -8, y: 2, z: 62 },
  R_Forearm: { x: 12, y: 0, z: -1 },
  R_Hand: { x: 0, y: 0, z: 2 },
  Spine01: { x: -2, y: 0, z: 0 },
  Spine02: { x: 1, y: 0, z: 0 },
  Head: { x: 1, y: 0, z: 0 },
};

const testerBoneBlocklist = /^(Root|Hip)$|Twist|ToeBase/i;
const floorPropHome = workshopAnchors.floorPropHome;
const chairSeatTarget = workshopAnchors.chairSeatTarget;
const chairApproachTarget = workshopAnchors.chairApproachTarget;
const chairYaw = workshopAnchors.chairYaw;
const propStandTarget = workshopAnchors.propStandTarget;
const propReachYaw = workshopAnchors.propReachYaw;

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    const material = mesh.material;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else if (material) {
      material.dispose();
    }
  });
}

function collectBones(model: THREE.Object3D) {
  const bones: BoneMap = {};

  model.traverse((child) => {
    if ((child as THREE.Bone).isBone) {
      bones[child.name] = child as THREE.Bone;
    }
  });

  return bones;
}

function getNamedRegion(boneName: string) {
  if (/head|neck/i.test(boneName)) {
    return 'head';
  }

  if (/clavicle|upperarm|forearm|hand/i.test(boneName)) {
    return 'arm';
  }

  if (/thigh|calf|foot|toe/i.test(boneName)) {
    return 'leg';
  }

  if (/spine|waist|pelvis|hip|root/i.test(boneName)) {
    return 'torso';
  }

  return 'unknown';
}

function getNamedSide(boneName: string) {
  if (/^(L_|Left|left)/.test(boneName)) {
    return 'left';
  }

  if (/^(R_|Right|right)/.test(boneName)) {
    return 'right';
  }

  return 'center';
}

function getBoneLimits(boneName: string): BoneLimits {
  if (/^(Root|Hip)$|Twist/i.test(boneName)) {
    return lockedLimits;
  }

  if (/toe/i.test(boneName)) {
    return lockedLimits;
  }

  if (/head/i.test(boneName)) {
    return {
      x: { min: -22, max: 22 },
      y: { min: -42, max: 42 },
      z: { min: -18, max: 18 },
    };
  }

  if (/neck/i.test(boneName)) {
    return {
      x: { min: -16, max: 16 },
      y: { min: -32, max: 32 },
      z: { min: -14, max: 14 },
    };
  }

  if (/spine|waist|pelvis/i.test(boneName)) {
    return {
      x: { min: -10, max: 12 },
      y: { min: -12, max: 12 },
      z: { min: -10, max: 10 },
    };
  }

  if (/clavicle/i.test(boneName)) {
    return {
      x: { min: -24, max: 24 },
      y: { min: -28, max: 28 },
      z: { min: -38, max: 38 },
    };
  }

  if (/upperarm/i.test(boneName)) {
    return {
      x: { min: -95, max: 70 },
      y: { min: -52, max: 52 },
      z: { min: -105, max: 105 },
    };
  }

  if (/forearm/i.test(boneName)) {
    return {
      x: { min: -8, max: 118 },
      y: { min: -24, max: 24 },
      z: { min: -24, max: 24 },
    };
  }

  if (/hand/i.test(boneName)) {
    return {
      x: { min: -38, max: 38 },
      y: { min: -44, max: 44 },
      z: { min: -48, max: 48 },
    };
  }

  if (/thigh/i.test(boneName)) {
    return {
      x: { min: -42, max: 48 },
      y: { min: -6, max: 6 },
      z: { min: -8, max: 8 },
    };
  }

  if (/calf/i.test(boneName)) {
    return {
      x: { min: -70, max: 5 },
      y: { min: 0, max: 0 },
      z: { min: 0, max: 0 },
    };
  }

  if (/foot/i.test(boneName)) {
    return {
      x: { min: -22, max: 26 },
      y: { min: -5, max: 5 },
      z: { min: -6, max: 6 },
    };
  }

  return defaultLimits;
}

function clampRotation(boneName: string, rotation: BoneRotation) {
  const limits = getBoneLimits(boneName);

  return {
    x: THREE.MathUtils.clamp(rotation.x, limits.x.min, limits.x.max),
    y: THREE.MathUtils.clamp(rotation.y, limits.y.min, limits.y.max),
    z: THREE.MathUtils.clamp(rotation.z, limits.z.min, limits.z.max),
  };
}

function clampPose(pose: PoseRotations) {
  return Object.entries(pose).reduce<PoseRotations>((nextPose, [boneName, rotation]) => {
    nextPose[boneName] = clampRotation(boneName, rotation);
    return nextPose;
  }, {});
}

function analyzeBoneProfiles(model: THREE.Object3D, bones: BoneMap) {
  const stats = new Map<string, { weight: number; center: THREE.Vector3 }>();

  Object.keys(bones).forEach((boneName) => {
    stats.set(boneName, { weight: 0, center: new THREE.Vector3() });
  });

  model.updateMatrixWorld(true);
  model.traverse((child) => {
    const skinnedMesh = child as THREE.SkinnedMesh;
    if (!skinnedMesh.isSkinnedMesh) {
      return;
    }

    const geometry = skinnedMesh.geometry;
    const position = geometry.getAttribute('position');
    const skinIndex = geometry.getAttribute('skinIndex');
    const skinWeight = geometry.getAttribute('skinWeight');
    if (!position || !skinIndex || !skinWeight) {
      return;
    }

    const vertex = new THREE.Vector3();
    const worldVertex = new THREE.Vector3();

    for (let i = 0; i < position.count; i += 1) {
      vertex.fromBufferAttribute(position, i);
      worldVertex.copy(vertex).applyMatrix4(skinnedMesh.matrixWorld);

      for (let slot = 0; slot < 4; slot += 1) {
        const weight = skinWeight.getComponent(i, slot);
        if (weight <= 0.035) {
          continue;
        }

        const boneIndex = skinIndex.getComponent(i, slot);
        const boneName = skinnedMesh.skeleton.bones[boneIndex]?.name;
        const stat = boneName ? stats.get(boneName) : undefined;
        if (!stat) {
          continue;
        }

        stat.weight += weight;
        stat.center.addScaledVector(worldVertex, weight);
      }
    }
  });

  return Object.keys(bones)
    .sort()
    .reduce<Record<string, BoneProfile>>((profiles, boneName) => {
      const stat = stats.get(boneName);
      const center = stat && stat.weight > 0 ? stat.center.clone().divideScalar(stat.weight) : new THREE.Vector3();
      profiles[boneName] = {
        boneName,
        region: getNamedRegion(boneName),
        side: getNamedSide(boneName),
        center: {
          x: Number(center.x.toFixed(3)),
          y: Number(center.y.toFixed(3)),
          z: Number(center.z.toFixed(3)),
        },
        influence: Number((stat?.weight ?? 0).toFixed(1)),
        limits: getBoneLimits(boneName),
      };
      return profiles;
    }, {});
}

function frameModel(model: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(model);
  if (box.isEmpty()) {
    return;
  }

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = size.y > 0 ? 1.42 / size.y : 1;

  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
}

function resetSkinnedMeshesToBindPose(model: THREE.Object3D) {
  model.traverse((child) => {
    const skinnedMesh = child as THREE.SkinnedMesh;
    if (skinnedMesh.isSkinnedMesh) {
      skinnedMesh.skeleton.pose();
    }
  });
}

function createZeroPose(boneNames: string[]) {
  return boneNames.reduce<PoseRotations>((pose, boneName) => {
    pose[boneName] = { ...emptyRotation };
    return pose;
  }, {});
}

function rotateBone(
  baseRotations: Map<string, THREE.Quaternion>,
  bone: THREE.Bone,
  rotation: BoneRotation,
  probeOffset: Partial<BoneRotation>,
) {
  const base = baseRotations.get(bone.name);
  if (base) {
    bone.quaternion.copy(base);
  }

  const safeRotation = clampRotation(bone.name, {
    x: rotation.x + (probeOffset.x ?? 0),
    y: rotation.y + (probeOffset.y ?? 0),
    z: rotation.z + (probeOffset.z ?? 0),
  });

  bone.rotateX(THREE.MathUtils.degToRad(safeRotation.x));
  bone.rotateY(THREE.MathUtils.degToRad(safeRotation.y));
  bone.rotateZ(THREE.MathUtils.degToRad(safeRotation.z));
}

function getInitialYaw() {
  if (typeof window === 'undefined') {
    return defaultModelYaw;
  }

  const yawParam = new URLSearchParams(window.location.search).get('yaw');
  const yaw = yawParam === null ? Number.NaN : Number(yawParam);
  return Number.isFinite(yaw) ? yaw : defaultModelYaw;
}

function shouldAutoplaySequence() {
  if (typeof window === 'undefined') {
    return false;
  }

  return new URLSearchParams(window.location.search).get('play') === '1';
}

function shouldAutoTestBones() {
  if (typeof window === 'undefined') {
    return false;
  }

  return new URLSearchParams(window.location.search).get('test') === '1';
}

function shouldAutostartBrain() {
  if (typeof window === 'undefined') {
    return false;
  }

  return new URLSearchParams(window.location.search).get('brain') === '1';
}

function easeInOut(value: number) {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function seededNoise(value: number) {
  return THREE.MathUtils.euclideanModulo(Math.sin(value * 12.9898) * 43758.5453, 1);
}

function yawToward(fromX: number, fromZ: number, toX: number, toZ: number) {
  const angle = THREE.MathUtils.radToDeg(Math.atan2(toX - fromX, toZ - fromZ));
  return defaultModelYaw + angle;
}

function steppedProgress(progress: number, stepCount: number) {
  const bounded = THREE.MathUtils.clamp(progress, 0, 1);
  const scaled = bounded * stepCount;
  const stepIndex = Math.floor(scaled);
  const stepPhase = scaled - stepIndex;
  const plantedEase = easeInOut(stepPhase);
  return (stepIndex + plantedEase) / stepCount;
}

function addRotation(pose: PoseRotations, boneName: string, rotation: Partial<BoneRotation>) {
  const current = pose[boneName] ?? emptyRotation;
  pose[boneName] = {
    x: current.x + (rotation.x ?? 0),
    y: current.y + (rotation.y ?? 0),
    z: current.z + (rotation.z ?? 0),
  };
}

function mergePose(basePose: PoseRotations, overlayPose: Record<string, Partial<BoneRotation>>) {
  const merged: PoseRotations = {};

  Object.entries(basePose).forEach(([boneName, rotation]) => {
    merged[boneName] = { ...rotation };
  });

  Object.entries(overlayPose).forEach(([boneName, rotation]) => {
    addRotation(merged, boneName, rotation);
  });

  return merged;
}

function walkPose(stridePhase: number, walkWeight: number, waveWeight: number) {
  const pose = mergePose(standingPose, {});
  const strideWave = Math.sin(stridePhase);
  const counterStrideWave = Math.sin(stridePhase + Math.PI);
  const stride = Math.sign(strideWave) * Math.pow(Math.abs(strideWave), 0.82) * walkWeight;
  const counterStride = Math.sign(counterStrideWave) * Math.pow(Math.abs(counterStrideWave), 0.82) * walkWeight;
  const lift = Math.pow(Math.max(0, Math.sin(stridePhase)), 1.8) * walkWeight;
  const counterLift = Math.pow(Math.max(0, Math.sin(stridePhase + Math.PI)), 1.8) * walkWeight;
  const waveArc = Math.sin(stridePhase * 1.35) * waveWeight;
  const leftKnee = lift * 24 + Math.max(0, -stride) * 10;
  const rightKnee = counterLift * 24 + Math.max(0, -counterStride) * 10;
  const leftFootPlant = Math.max(0, -strideWave) * walkWeight;
  const rightFootPlant = Math.max(0, -counterStrideWave) * walkWeight;

  addRotation(pose, 'Spine01', { x: Math.abs(strideWave) * 0.7 * walkWeight, z: strideWave * 1.2 * walkWeight });
  addRotation(pose, 'L_Thigh', { x: stride * 19, z: 1.2 * walkWeight });
  addRotation(pose, 'L_Calf', { x: -leftKnee });
  addRotation(pose, 'L_Foot', { x: leftKnee * 0.42 - stride * 4 - lift * 3 + leftFootPlant * 3 });
  addRotation(pose, 'R_Thigh', { x: counterStride * 19, z: -1.2 * walkWeight });
  addRotation(pose, 'R_Calf', { x: -rightKnee });
  addRotation(pose, 'R_Foot', { x: rightKnee * 0.42 - counterStride * 4 - counterLift * 3 + rightFootPlant * 3 });

  addRotation(pose, 'L_Upperarm', { x: -stride * 10, z: stride * 4 });
  addRotation(pose, 'R_Upperarm', { x: -counterStride * 10, z: -counterStride * 4 });
  addRotation(pose, 'L_Forearm', { x: Math.max(0, stride) * 8 });

  if (waveWeight > 0) {
    addRotation(pose, 'R_Clavicle', { z: -18 * waveWeight });
    addRotation(pose, 'R_Upperarm', { x: -48 * waveWeight, z: -90 * waveWeight });
    addRotation(pose, 'R_Forearm', { x: 64 * waveWeight });
    addRotation(pose, 'R_Hand', { x: waveArc * 18, y: waveArc * 6, z: waveArc * 32 });
  }

  return clampPose(pose);
}

function livingIdlePose(elapsedSeconds: number, attention = 0) {
  const lookSlow = Math.sin(elapsedSeconds * 0.58 + attention);
  const lookFast = Math.sin(elapsedSeconds * 1.37 + 1.4);
  const breathe = Math.sin(elapsedSeconds * 1.8);
  const weightShift = Math.sin(elapsedSeconds * 0.72 + 0.6);
  const handFidget = Math.sin(elapsedSeconds * 2.3 + attention);

  return clampPose(mergePose(standingPose, {
    Head: { x: 1 + breathe * 1.2, y: lookSlow * 18 + lookFast * 4, z: lookSlow * 2.4 },
    NeckTwist01: { y: lookSlow * 9, z: lookFast * 1.5 },
    Spine01: { x: -2 + breathe * 0.9, y: lookSlow * 1.8, z: weightShift * 2.3 },
    Spine02: { x: 1 + breathe * 0.55, z: weightShift * 1.5 },
    L_Upperarm: { x: handFidget * 1.8, z: weightShift * 2 },
    L_Forearm: { x: 4 + Math.max(0, handFidget) * 4 },
    L_Hand: { z: handFidget * 5 },
    R_Upperarm: { x: -handFidget * 1.4, z: -weightShift * 1.6 },
    R_Forearm: { x: 3 + Math.max(0, -handFidget) * 4 },
    R_Hand: { z: Math.sin(elapsedSeconds * 2.1 + 2.2) * 5 },
    L_Thigh: { x: weightShift * 1.2, z: weightShift * 1.5 },
    R_Thigh: { x: -weightShift * 1.2, z: -weightShift * 1.5 },
  }));
}

function curiousPeekPose(elapsedSeconds: number, side = 1) {
  const peek = Math.sin(elapsedSeconds * 3.6);
  const pose = livingIdlePose(elapsedSeconds, side * 1.8);
  addRotation(pose, 'Head', { y: side * 20, z: side * 4 });
  addRotation(pose, 'NeckTwist01', { y: side * 12 });
  addRotation(pose, 'Spine01', { z: side * 4, y: side * 3 });
  addRotation(pose, 'L_Hand', { z: peek * 5 });
  addRotation(pose, 'R_Hand', { z: -peek * 5 });
  return clampPose(pose);
}

function softTurnPose(elapsedSeconds: number, turnWeight: number, side = 1) {
  const step = Math.sin(elapsedSeconds * 5.6);
  const pose = livingIdlePose(elapsedSeconds, side);
  addRotation(pose, 'Head', { y: side * 18 * turnWeight });
  addRotation(pose, 'Spine01', { y: side * 7 * turnWeight, z: side * 2 * turnWeight });
  addRotation(pose, 'L_Thigh', { x: step * 8 * turnWeight, z: side * 3 * turnWeight });
  addRotation(pose, 'R_Thigh', { x: -step * 8 * turnWeight, z: -side * 3 * turnWeight });
  addRotation(pose, 'L_Calf', { x: -Math.max(0, -step) * 12 * turnWeight });
  addRotation(pose, 'R_Calf', { x: -Math.max(0, step) * 12 * turnWeight });
  addRotation(pose, 'L_Foot', { x: -step * 4 * turnWeight });
  addRotation(pose, 'R_Foot', { x: step * 4 * turnWeight });
  return clampPose(pose);
}

function getBrainFrame(elapsedSeconds: number, seed: number): BrainFrame {
  const cycleLength = 56;
  const cycle = elapsedSeconds % cycleLength;
  const cycleIndex = Math.floor(elapsedSeconds / cycleLength);
  const variant = seededNoise(seed + cycleIndex * 3.17);
  const wanderSide = variant > 0.5 ? 1 : -1;
  const attentionOffset = seededNoise(seed + cycleIndex * 7.31) * 4 - 2;
  const wanderYaw = defaultModelYaw + wanderSide * 125;
  const wanderX = -0.35 * wanderSide;
  const homeX = 0;
  const homeZ = -0.35;
  const propOnFloor = { held: false, ...floorPropHome };
  const propHeld = (grab = 1) => ({
    held: true,
    grab,
    x: 0.06 + Math.sin(elapsedSeconds * 1.2) * 0.015,
    y: 0.86 + Math.sin(elapsedSeconds * 1.7) * 0.02,
    z: 0.18,
  });

  if (cycle < 5.2) {
    return {
      label: 'Brain: quietly alive',
      modelYaw: defaultModelYaw,
      x: homeX,
      z: homeZ,
      prop: propOnFloor,
      rotations: livingIdlePose(elapsedSeconds, attentionOffset),
    };
  }

  if (cycle < 7.4) {
    return {
      label: 'Brain: noticed something',
      modelYaw: defaultModelYaw,
      x: homeX,
      z: homeZ,
      prop: propOnFloor,
      rotations: curiousPeekPose(elapsedSeconds, wanderSide),
    };
  }

  if (cycle < 12.6) {
    const rawProgress = (cycle - 7.4) / 5.2;
    const stepCount = 4;
    const progress = steppedProgress(rawProgress, stepCount);
    const pose = walkPose(rawProgress * stepCount * Math.PI, 0.62, 0);
    addRotation(pose, 'Head', { y: Math.sin(elapsedSeconds * 0.7) * 7 });
    addRotation(pose, 'Spine01', { z: Math.sin(elapsedSeconds * 6.4) * 1.4 });

    return {
      label: 'Brain: wandering closer',
      modelYaw: yawToward(homeX, homeZ, 0.16, 0.38),
      x: THREE.MathUtils.lerp(homeX, 0.16, progress),
      z: THREE.MathUtils.lerp(homeZ, 0.38, progress),
      prop: propOnFloor,
      rotations: clampPose(pose),
    };
  }

  if (cycle < 16.2) {
    const hello = easeInOut((cycle - 12.6) / 0.8) * (1 - easeInOut((cycle - 15.4) / 0.8));
    const pose = livingIdlePose(elapsedSeconds, 2.4);
    addRotation(pose, 'Head', { y: -6 });
    addRotation(pose, 'R_Clavicle', { z: -12 * hello });
    addRotation(pose, 'R_Upperarm', { x: -34 * hello, z: -72 * hello });
    addRotation(pose, 'R_Forearm', { x: 54 * hello });
    addRotation(pose, 'R_Hand', { z: Math.sin(elapsedSeconds * 8.2) * 22 * hello });

    return {
      label: 'Brain: small hello',
      modelYaw: defaultModelYaw,
      x: 0.16,
      z: 0.38,
      prop: propOnFloor,
      rotations: clampPose(pose),
    };
  }

  if (cycle < 18.6) {
    const turn = easeInOut((cycle - 16.2) / 0.7);
    const reach = easeInOut((cycle - 16.9) / 1.2);
    const pose = livingIdlePose(elapsedSeconds, -1.4);
    addRotation(pose, 'Head', { x: 12 * reach, y: -18 - 10 * reach });
    addRotation(pose, 'Spine01', { x: 10 * reach, y: -4 * reach, z: -8 * reach });
    addRotation(pose, 'Spine02', { x: 5 * reach, z: -3 * reach });
    addRotation(pose, 'R_Clavicle', { x: -6 * reach, z: -12 * reach });
    addRotation(pose, 'R_Upperarm', { x: -64 * reach, y: -12 * reach, z: -66 * reach });
    addRotation(pose, 'R_Forearm', { x: 82 * reach, y: -8 * reach });
    addRotation(pose, 'R_Hand', { x: -18 * reach, y: -14 * reach, z: 20 * reach });
    addRotation(pose, 'R_Thigh', { x: 6 * reach, z: -2 * reach });
    addRotation(pose, 'R_Calf', { x: -10 * reach });

    return {
      label: reach > 0.78 ? 'Brain: gripping the floor object' : 'Brain: reaching for the floor object',
      modelYaw: THREE.MathUtils.lerp(defaultModelYaw, propReachYaw, turn),
      x: THREE.MathUtils.lerp(0.16, propStandTarget.x, turn),
      z: THREE.MathUtils.lerp(0.38, propStandTarget.z, turn),
      prop: reach > 0.82 ? propHeld(1) : propOnFloor,
      rotations: clampPose(pose),
    };
  }

  if (cycle < 22.2) {
    const carry = easeInOut((cycle - 18.6) / 0.8) * (1 - easeInOut((cycle - 21.4) / 0.8));
    const pose = livingIdlePose(elapsedSeconds, 0.7);
    addRotation(pose, 'Head', { y: -8, x: 4 });
    addRotation(pose, 'R_Upperarm', { x: -24 * carry, z: -38 * carry });
    addRotation(pose, 'R_Forearm', { x: 48 * carry });
    addRotation(pose, 'R_Hand', { z: Math.sin(elapsedSeconds * 4.5) * 8 * carry });

    return {
      label: 'Brain: inspecting the little part',
      modelYaw: propReachYaw,
      x: propStandTarget.x,
      z: propStandTarget.z,
      prop: carry > 0.12 ? propHeld(1) : propOnFloor,
      rotations: clampPose(pose),
    };
  }

  if (cycle < 24.6) {
    const reach = easeInOut((cycle - 22.2) / 1.1);
    const release = 1 - easeInOut((cycle - 23.4) / 0.55);
    const pose = livingIdlePose(elapsedSeconds, -1);
    addRotation(pose, 'Head', { x: 10 * reach, y: -18 });
    addRotation(pose, 'Spine01', { x: 8 * reach, y: -3 * reach, z: -6 * reach });
    addRotation(pose, 'R_Upperarm', { x: -58 * reach, y: -10 * reach, z: -62 * reach });
    addRotation(pose, 'R_Forearm', { x: 78 * reach });
    addRotation(pose, 'R_Hand', { x: -15 * reach, y: -12 * reach, z: 18 * reach });

    return {
      label: 'Brain: putting the part down',
      modelYaw: propReachYaw,
      x: propStandTarget.x,
      z: propStandTarget.z,
      prop: release > 0.08 ? propHeld(release) : propOnFloor,
      rotations: clampPose(pose),
    };
  }

  if (cycle < 27.1) {
    const turn = easeInOut((cycle - 24.6) / 2.5);

    return {
      label: 'Brain: turning to wander',
      modelYaw: THREE.MathUtils.lerp(propReachYaw, wanderYaw, turn),
      x: propStandTarget.x,
      z: propStandTarget.z,
      prop: propOnFloor,
      rotations: softTurnPose(elapsedSeconds, 1, -1),
    };
  }

  if (cycle < 33.5) {
    const rawProgress = (cycle - 27.1) / 6.4;
    const stepCount = 5;
    const progress = steppedProgress(rawProgress, stepCount);
    const pose = walkPose(rawProgress * stepCount * Math.PI, 0.66, 0);
    addRotation(pose, 'Head', { y: Math.sin(elapsedSeconds * 0.82) * 5 });

    return {
      label: 'Brain: wandering across screen',
      modelYaw: wanderYaw,
      x: THREE.MathUtils.lerp(propStandTarget.x, wanderX, progress),
      z: THREE.MathUtils.lerp(propStandTarget.z, -0.3, progress),
      prop: propOnFloor,
      rotations: clampPose(pose),
    };
  }

  if (cycle < 36) {
    const rawProgress = (cycle - 33.5) / 2.5;
    const stepCount = 2;
    const progress = steppedProgress(rawProgress, stepCount);
    const pose = walkPose(rawProgress * stepCount * Math.PI, 0.45, 0);
    addRotation(pose, 'Head', { y: 10 });

    return {
      label: 'Brain: approaching the chair',
      modelYaw: yawToward(wanderX, -0.3, chairApproachTarget.x, chairApproachTarget.z),
      x: THREE.MathUtils.lerp(wanderX, chairApproachTarget.x, progress),
      z: THREE.MathUtils.lerp(-0.3, chairApproachTarget.z, progress),
      prop: propOnFloor,
      rotations: clampPose(pose),
    };
  }

  if (cycle < 38.4) {
    const turn = easeInOut((cycle - 36) / 2.4);

    return {
      label: 'Brain: turning before sitting',
      modelYaw: THREE.MathUtils.lerp(yawToward(wanderX, -0.3, chairApproachTarget.x, chairApproachTarget.z), chairYaw, turn),
      x: chairApproachTarget.x,
      z: chairApproachTarget.z,
      prop: propOnFloor,
      rotations: softTurnPose(elapsedSeconds, 1, -1),
    };
  }

  if (cycle < 43.4) {
    const sitDown = easeInOut((cycle - 38.4) / 1.8);
    const standUp = easeInOut((cycle - 41.8) / 1.6);
    const sit = sitDown * (1 - standUp);
    const pose = livingIdlePose(elapsedSeconds, 2);
    addRotation(pose, 'Head', { y: 12, x: -2 });
    addRotation(pose, 'Spine01', { x: -4 + sit * 10 });
    addRotation(pose, 'Spine02', { x: sit * 6 });
    addRotation(pose, 'L_Thigh', { x: sit * 38 });
    addRotation(pose, 'R_Thigh', { x: sit * 38 });
    addRotation(pose, 'L_Calf', { x: -sit * 58 });
    addRotation(pose, 'R_Calf', { x: -sit * 58 });
    addRotation(pose, 'L_Foot', { x: sit * 20 });
    addRotation(pose, 'R_Foot', { x: sit * 20 });
    addRotation(pose, 'L_Upperarm', { z: -sit * 10 });
    addRotation(pose, 'R_Upperarm', { z: sit * 10 });

    return {
      label: sit > 0.5 ? 'Brain: sitting with weight on the chair' : 'Brain: lowering into the chair',
      modelYaw: chairYaw,
      x: THREE.MathUtils.lerp(chairApproachTarget.x, chairSeatTarget.x, sitDown),
      y: -0.08 * sit,
      z: THREE.MathUtils.lerp(chairApproachTarget.z, chairSeatTarget.z, sitDown),
      prop: propOnFloor,
      rotations: clampPose(pose),
    };
  }

  if (cycle < 46.1) {
    const turn = easeInOut((cycle - 43.4) / 2.7);

    return {
      label: 'Brain: turning back toward you',
      modelYaw: THREE.MathUtils.lerp(chairYaw, defaultModelYaw, turn),
      x: chairSeatTarget.x,
      z: chairSeatTarget.z,
      prop: propOnFloor,
      rotations: softTurnPose(elapsedSeconds, 1, 1),
    };
  }

  const rawProgress = (cycle - 46.1) / 9.9;
  const progress = steppedProgress(rawProgress, 6);
  const pose = walkPose(rawProgress * 6 * Math.PI, 0.48, 0);
  addRotation(pose, 'Head', { y: Math.sin(elapsedSeconds * 0.7) * 8 });

  return {
    label: 'Brain: settling back in',
    modelYaw: defaultModelYaw,
    x: THREE.MathUtils.lerp(chairSeatTarget.x, homeX, progress),
    z: THREE.MathUtils.lerp(chairSeatTarget.z, homeZ, progress),
    prop: propOnFloor,
    rotations: clampPose(pose),
  };
}

function getSequenceFrame(elapsedSeconds: number): SequenceFrame {
  const t = THREE.MathUtils.clamp(elapsedSeconds, 0, sequenceDuration);
  const stridePhase = elapsedSeconds * 7.8;

  if (t < 1.4) {
    return {
      label: 'Sequence: standing idle',
      modelYaw: defaultModelYaw,
      z: -0.85,
      rotations: mergePose(standingPose, {}),
    };
  }

  if (t < 5.2) {
    const progress = easeInOut((t - 1.4) / 3.8);
    const waveWeight = easeInOut((progress - 0.28) / 0.44);

    return {
      label: 'Sequence: walking toward camera and waving',
      modelYaw: defaultModelYaw,
      z: THREE.MathUtils.lerp(-0.85, 0.35, progress),
      rotations: walkPose(stridePhase, 1, waveWeight),
    };
  }

  if (t < 6.4) {
    return {
      label: 'Sequence: waving hello',
      modelYaw: defaultModelYaw,
      z: 0.35,
      rotations: walkPose(stridePhase, 0, 1),
    };
  }

  if (t < 7.65) {
    const progress = easeInOut((t - 6.4) / 1.25);

    return {
      label: 'Sequence: turning around',
      modelYaw: THREE.MathUtils.lerp(defaultModelYaw, defaultModelYaw + 180, progress),
      z: 0.35,
      rotations: walkPose(stridePhase, 0, 1 - progress),
    };
  }

  const progress = easeInOut((t - 7.65) / (sequenceDuration - 7.65));

  return {
    label: 'Sequence: walking away',
    modelYaw: defaultModelYaw + 180,
    z: THREE.MathUtils.lerp(0.35, -1.05, progress),
    rotations: walkPose(stridePhase, 1, 0),
  };
}

export function TripoPuppeteerLab() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const floorPropRef = useRef<THREE.Object3D | null>(null);
  const skeletonHelperRef = useRef<THREE.SkeletonHelper | null>(null);
  const bonesRef = useRef<BoneMap>({});
  const baseRotationsRef = useRef(new Map<string, THREE.Quaternion>());
  const basePositionRef = useRef(new THREE.Vector3());
  const handWorldRef = useRef(new THREE.Vector3());
  const propTargetRef = useRef(new THREE.Vector3());
  const propFloorRef = useRef(new THREE.Vector3(floorPropHome.x, floorPropHome.y, floorPropHome.z));
  const judgementLastUpdateRef = useRef(0);
  const poseRef = useRef<PoseRotations>({});
  const probeRef = useRef<ProbeState | null>(null);
  const modelYawRef = useRef(getInitialYaw());
  const boneNamesRef = useRef<string[]>([]);
  const boneProfilesRef = useRef<Record<string, BoneProfile>>({});
  const sequenceStartRef = useRef<number | null>(null);
  const sequencePendingRef = useRef(shouldAutoplaySequence());
  const autoTesterStartRef = useRef<number | null>(null);
  const autoTesterPendingRef = useRef(shouldAutoTestBones());
  const autoTesterSlotRef = useRef(-1);
  const brainStartRef = useRef<number | null>(null);
  const brainPendingRef = useRef(shouldAutostartBrain());
  const brainSeedRef = useRef(Math.random() * 1000);
  const lastStatusRef = useRef('');

  const [status, setStatus] = useState('Loading robot rig');
  const [boneNames, setBoneNames] = useState<string[]>([]);
  const [selectedBone, setSelectedBone] = useState('');
  const [pose, setPose] = useState<PoseRotations>({});
  const [probe, setProbe] = useState<ProbeState | null>(null);
  const [modelYaw, setModelYaw] = useState(() => modelYawRef.current);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [filter, setFilter] = useState('');
  const [sequencePlaying, setSequencePlaying] = useState(false);
  const [autoTester, setAutoTester] = useState<AutoTesterState>({ running: false, boneName: '', axis: 'x' });
  const [boneProfiles, setBoneProfiles] = useState<Record<string, BoneProfile>>({});
  const [brainRunning, setBrainRunning] = useState(false);
  const [motionJudgement, setMotionJudgement] = useState<MotionJudgement>({
    passed: true,
    label: 'Motion judge: waiting for rig',
    results: [],
  });

  const filteredBoneNames = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return term ? boneNames.filter((boneName) => boneName.toLowerCase().includes(term)) : boneNames;
  }, [boneNames, filter]);

  useEffect(() => {
    poseRef.current = pose;
  }, [pose]);

  useEffect(() => {
    probeRef.current = probe;
  }, [probe]);

  useEffect(() => {
    modelYawRef.current = modelYaw;
  }, [modelYaw]);

  useEffect(() => {
    boneNamesRef.current = boneNames;
  }, [boneNames]);

  useEffect(() => {
    boneProfilesRef.current = boneProfiles;
  }, [boneProfiles]);

  useEffect(() => {
    if (skeletonHelperRef.current) {
      skeletonHelperRef.current.visible = showSkeleton;
    }
  }, [showSkeleton]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd6d0c5);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 100);
    camera.position.set(0, 1.16, 3.3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.target.set(0, 0.72, -0.2);
    controls.minDistance = 1.35;
    controls.maxDistance = 4.5;

    const hemiLight = new THREE.HemisphereLight(0xf9efe1, 0x635a50, 2.25);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3);
    keyLight.position.set(2.3, 3.4, 2.3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa6c8ff, 0.9);
    fillLight.position.set(-2.7, 1.6, 1.4);
    scene.add(fillLight);

    const workshop = createWorkshopScene();
    scene.add(workshop.group);
    const floorProp = workshop.floorProp;
    floorPropRef.current = floorProp;

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    let frameId = 0;
    let cancelled = false;
    const clock = new THREE.Clock();

    const render = () => {
      frameId = window.requestAnimationFrame(render);
      const model = modelRef.current;

      if (model) {
        const elapsedTime = clock.getElapsedTime();
        model.position.copy(basePositionRef.current);
        if (sequencePendingRef.current) {
          sequencePendingRef.current = false;
          sequenceStartRef.current = elapsedTime;
        }
        if (autoTesterPendingRef.current) {
          autoTesterPendingRef.current = false;
          autoTesterStartRef.current = elapsedTime;
        }
        if (brainPendingRef.current) {
          brainPendingRef.current = false;
          brainStartRef.current = elapsedTime;
        }

        const sequenceStart = sequenceStartRef.current;
        const sequenceElapsed = sequenceStart === null ? null : elapsedTime - sequenceStart;
        const sequenceFrame = sequenceElapsed === null ? null : getSequenceFrame(sequenceElapsed);
        const brainStart = brainStartRef.current;
        const brainFrame = brainStart === null ? null : getBrainFrame(elapsedTime - brainStart, brainSeedRef.current);
        const activePose = sequenceFrame?.rotations ?? brainFrame?.rotations ?? poseRef.current;
        const activeYaw = sequenceFrame?.modelYaw ?? brainFrame?.modelYaw ?? modelYawRef.current;
        const activeX = brainFrame?.x ?? 0;
        const activeY = brainFrame?.y ?? 0;
        const activeZ = sequenceFrame?.z ?? brainFrame?.z ?? 0;
        const activeProp = brainFrame?.prop ?? { held: false, ...floorPropHome };
        const activeLabel = sequenceFrame?.label ?? brainFrame?.label ?? 'Manual pose';
        const autoTesterStart = autoTesterStartRef.current;
        const testerSlot = autoTesterStart === null ? null : Math.floor((elapsedTime - autoTesterStart) / testerSlotSeconds);
        let testerProbe: ProbeState | null = null;

        if (sequenceElapsed !== null && sequenceElapsed >= sequenceDuration) {
          sequenceStartRef.current = null;
          setSequencePlaying(false);
        }

        model.position.x += activeX;
        model.position.y += activeY;
        model.position.z += activeZ;
        model.rotation.set(0, THREE.MathUtils.degToRad(activeYaw), 0);

        const activeProbe = probeRef.current;
        const probeValue = Math.sin(elapsedTime * probeSpeed) * probeAmplitude;
        if (testerSlot !== null && boneNamesRef.current.length > 0) {
          const testableBones = boneNamesRef.current.filter((boneName) => !testerBoneBlocklist.test(boneName));
          if (testableBones.length === 0) {
            autoTesterStartRef.current = null;
            setAutoTester({ running: false, boneName: '', axis: 'x' });
          } else {
          const totalSlots = testableBones.length * axes.length;
          const wrappedSlot = ((testerSlot % totalSlots) + totalSlots) % totalSlots;
          const boneName = testableBones[Math.floor(wrappedSlot / axes.length)];
          const axis = axes[wrappedSlot % axes.length];
          testerProbe = { boneName, axis };

          if (wrappedSlot !== autoTesterSlotRef.current) {
            autoTesterSlotRef.current = wrappedSlot;
            setSelectedBone(boneName);
            setAutoTester({ running: true, boneName, axis });
            const testStatus = `Auto testing ${boneName} ${axis.toUpperCase()} within safe limits`;
            lastStatusRef.current = testStatus;
            setStatus(testStatus);
          }
          }
        }

        Object.entries(bonesRef.current).forEach(([boneName, bone]) => {
          const rotation = activePose[boneName] ?? emptyRotation;
          const activeMotionProbe = testerProbe ?? activeProbe;
          const profile = boneProfilesRef.current[boneName];
          const limits = profile?.limits ?? getBoneLimits(boneName);
          const limit = activeMotionProbe?.boneName === boneName ? limits[activeMotionProbe.axis] : undefined;
          const safeProbeValue = limit ? THREE.MathUtils.clamp(probeValue, limit.min, limit.max) : probeValue;
          const probeOffset: Partial<BoneRotation> = activeMotionProbe?.boneName === boneName ? { [activeMotionProbe.axis]: safeProbeValue } : {};
          rotateBone(baseRotationsRef.current, bone, rotation, probeOffset);
        });

        if (floorPropRef.current) {
          if (activeProp.held && bonesRef.current.R_Hand) {
            model.updateMatrixWorld(true);
            bonesRef.current.R_Hand.getWorldPosition(handWorldRef.current);
            propTargetRef.current.copy(handWorldRef.current);
            propTargetRef.current.y -= 0.035;
            propTargetRef.current.x += Math.sin(elapsedTime * 1.4) * 0.006;
            propTargetRef.current.z += Math.cos(elapsedTime * 1.2) * 0.006;
            floorPropRef.current.position.copy(propFloorRef.current).lerp(propTargetRef.current, activeProp.grab ?? 1);
          } else {
            floorPropRef.current.position.set(activeProp.x, activeProp.y, activeProp.z);
          }
          floorPropRef.current.rotation.y = elapsedTime * (activeProp.held ? 0.32 : 0.8);
          floorPropRef.current.rotation.x = activeProp.held ? Math.sin(elapsedTime * 3.4) * 0.09 : 0;
        }

        if (elapsedTime - judgementLastUpdateRef.current > 0.28) {
          judgementLastUpdateRef.current = elapsedTime;
          model.updateMatrixWorld(true);
          setMotionJudgement(validateMotionFrame({
            label: activeLabel,
            pose: activePose,
            bones: bonesRef.current,
            modelYaw: activeYaw,
            prop: activeProp,
            propPosition: floorPropRef.current?.position ?? null,
            chairYaw,
            propReachYaw,
          }));
        }

        if (sequenceFrame?.label && sequenceFrame.label !== lastStatusRef.current) {
          lastStatusRef.current = sequenceFrame.label;
          setStatus(sequenceFrame.label);
        } else if (!sequenceFrame && brainFrame?.label && brainFrame.label !== lastStatusRef.current) {
          lastStatusRef.current = brainFrame.label;
          setStatus(brainFrame.label);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    resize();
    render();
    window.addEventListener('resize', resize);

    const loader = new GLTFLoader();
    loader.load(
      tripoSourcePath,
      (gltf: GLTF) => {
        if (cancelled) {
          disposeObject(gltf.scene);
          return;
        }

        const model = gltf.scene;
        resetSkinnedMeshesToBindPose(model);
        model.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        frameModel(model);
        scene.add(model);
        modelRef.current = model;
        basePositionRef.current.copy(model.position);

        const skeletonHelper = new THREE.SkeletonHelper(model);
        skeletonHelper.visible = false;
        scene.add(skeletonHelper);
        skeletonHelperRef.current = skeletonHelper;

        const bones = collectBones(model);
        const nextBoneNames = Object.keys(bones).sort();
        const zeroPose = createZeroPose(nextBoneNames);
        const profiles = analyzeBoneProfiles(model, bones);
        bonesRef.current = bones;
        boneNamesRef.current = nextBoneNames;
        boneProfilesRef.current = profiles;
        baseRotationsRef.current = new Map(nextBoneNames.map((boneName) => [boneName, bones[boneName].quaternion.clone()]));
        poseRef.current = zeroPose;
        setPose(zeroPose);
        setBoneNames(nextBoneNames);
        setBoneProfiles(profiles);
        setSelectedBone(nextBoneNames[0] ?? '');
        const readyStatus = `Rig ready: ${nextBoneNames.length} bones mapped to live controls`;
        lastStatusRef.current = readyStatus;
        setStatus(readyStatus);
        if (shouldAutoplaySequence()) {
          setSequencePlaying(true);
        }
        if (shouldAutoTestBones()) {
          setAutoTester({ running: true, boneName: nextBoneNames[0] ?? '', axis: 'x' });
        }
        if (shouldAutostartBrain()) {
          setBrainRunning(true);
        }
      },
      undefined,
      (error) => {
        if (!cancelled) {
          setStatus(error instanceof Error ? error.message : 'Could not load robot rig');
        }
      },
    );

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      controls.dispose();
      if (skeletonHelperRef.current) {
        scene.remove(skeletonHelperRef.current);
        skeletonHelperRef.current.dispose();
      }
      if (modelRef.current) {
        scene.remove(modelRef.current);
        disposeObject(modelRef.current);
      }
      scene.remove(workshop.group);
      workshop.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      modelRef.current = null;
      floorPropRef.current = null;
      skeletonHelperRef.current = null;
      bonesRef.current = {};
      baseRotationsRef.current = new Map();
    };
  }, []);

  const updateBoneAxis = (boneName: string, axis: Axis, value: number) => {
    const limits = boneProfiles[boneName]?.limits ?? getBoneLimits(boneName);
    const clampedValue = THREE.MathUtils.clamp(value, limits[axis].min, limits[axis].max);
    setPose((currentPose) => ({
      ...currentPose,
      [boneName]: {
        ...(currentPose[boneName] ?? emptyRotation),
        [axis]: clampedValue,
      },
    }));
  };

  const resetPose = () => {
    const zeroPose = createZeroPose(boneNames);
    setPose(zeroPose);
    setProbe(null);
    sequenceStartRef.current = null;
    sequencePendingRef.current = false;
    autoTesterStartRef.current = null;
    autoTesterPendingRef.current = false;
    autoTesterSlotRef.current = -1;
    brainStartRef.current = null;
    brainPendingRef.current = false;
    setSequencePlaying(false);
    setAutoTester({ running: false, boneName: '', axis: 'x' });
    setBrainRunning(false);
  };

  const applyStandingPose = () => {
    const safeStandingPose = clampPose(standingPose);
    setPose({
      ...createZeroPose(boneNames),
      ...safeStandingPose,
    });
    sequenceStartRef.current = null;
    sequencePendingRef.current = false;
    autoTesterStartRef.current = null;
    autoTesterPendingRef.current = false;
    autoTesterSlotRef.current = -1;
    brainStartRef.current = null;
    brainPendingRef.current = false;
    setProbe(null);
    setSequencePlaying(false);
    setAutoTester({ running: false, boneName: '', axis: 'x' });
    setBrainRunning(false);
    const standingStatus = 'Applied constrained standing pose';
    lastStatusRef.current = standingStatus;
    setStatus(standingStatus);
  };

  const playSequence = () => {
    sequenceStartRef.current = null;
    sequencePendingRef.current = true;
    autoTesterStartRef.current = null;
    autoTesterPendingRef.current = false;
    autoTesterSlotRef.current = -1;
    brainStartRef.current = null;
    brainPendingRef.current = false;
    setProbe(null);
    setAutoTester({ running: false, boneName: '', axis: 'x' });
    setBrainRunning(false);
    setSequencePlaying(true);
    const sequenceStatus = 'Sequence: starting';
    lastStatusRef.current = sequenceStatus;
    setStatus(sequenceStatus);
  };

  const toggleAutoTester = () => {
    if (autoTesterStartRef.current !== null) {
      autoTesterStartRef.current = null;
      autoTesterPendingRef.current = false;
      autoTesterSlotRef.current = -1;
      setAutoTester({ running: false, boneName: '', axis: 'x' });
      const stoppedStatus = 'Auto bone test stopped';
      lastStatusRef.current = stoppedStatus;
      setStatus(stoppedStatus);
      return;
    }

    sequenceStartRef.current = null;
    sequencePendingRef.current = false;
    setSequencePlaying(false);
    brainStartRef.current = null;
    brainPendingRef.current = false;
    setBrainRunning(false);
    setProbe(null);
    autoTesterStartRef.current = null;
    autoTesterPendingRef.current = true;
    autoTesterSlotRef.current = -1;
    setAutoTester({ running: true, boneName: boneNames[0] ?? '', axis: 'x' });
  };

  const toggleBrain = () => {
    if (brainStartRef.current !== null) {
      brainStartRef.current = null;
      brainPendingRef.current = false;
      setBrainRunning(false);
      const stoppedStatus = 'Brain stopped';
      lastStatusRef.current = stoppedStatus;
      setStatus(stoppedStatus);
      return;
    }

    sequenceStartRef.current = null;
    sequencePendingRef.current = false;
    autoTesterStartRef.current = null;
    autoTesterPendingRef.current = false;
    autoTesterSlotRef.current = -1;
    setSequencePlaying(false);
    setAutoTester({ running: false, boneName: '', axis: 'x' });
    setProbe(null);
    brainStartRef.current = null;
    brainPendingRef.current = true;
    setBrainRunning(true);
    const brainStatus = 'Brain starting';
    lastStatusRef.current = brainStatus;
    setStatus(brainStatus);
  };

  const copyPose = async () => {
    const payload = JSON.stringify({ modelYaw, pose, boneProfiles }, null, 2);
    await navigator.clipboard?.writeText(payload);
    setStatus('Current bone values copied');
  };

  const selectedProfile = selectedBone ? boneProfiles[selectedBone] : undefined;

  return (
    <main className="tripo-puppeteer bone-lab">
      <section className="tripo-stage" aria-label="Digital puppeteer bone test stage">
        <div className="tripo-canvas" ref={mountRef} />
        <div className="tripo-status" aria-live="polite">
          {status}
        </div>
      </section>

      <aside className="tripo-controls bone-lab-controls" aria-label="Bone controls">
        <div className="tripo-control-heading">
          <p>Digital puppeteer</p>
          <h1>Bone calibration lab</h1>
        </div>

        <div className="bone-lab-toolbar">
          <label className="bone-lab-toggle">
            <input type="checkbox" checked={showSkeleton} onChange={(event) => setShowSkeleton(event.target.checked)} />
            Skeleton
          </label>
          <button className={brainRunning ? 'is-active' : ''} type="button" onClick={toggleBrain}>
            {brainRunning ? 'Stop brain' : 'Brain'}
          </button>
          <button className={sequencePlaying ? 'is-active' : ''} type="button" onClick={playSequence}>
            Play sequence
          </button>
          <button className={autoTester.running ? 'is-active' : ''} type="button" onClick={toggleAutoTester}>
            {autoTester.running ? 'Stop test' : 'Auto test'}
          </button>
          <button type="button" onClick={applyStandingPose}>
            Stand
          </button>
          <button type="button" onClick={resetPose}>
            Reset pose
          </button>
          <button type="button" onClick={copyPose}>
            Copy values
          </button>
        </div>

        <label className="bone-lab-field">
          <span>Model yaw</span>
          <input
            max="180"
            min="-180"
            type="range"
            value={modelYaw}
            onChange={(event) => setModelYaw(Number(event.target.value))}
          />
          <input
            max="180"
            min="-180"
            type="number"
            value={modelYaw}
            onChange={(event) => setModelYaw(Number(event.target.value))}
          />
        </label>

        <section className={['motion-judge', motionJudgement.passed ? 'is-passing' : 'is-blocking'].join(' ')}>
          <div>
            <span>Motion judge</span>
            <strong>{motionJudgement.passed ? 'Passing' : 'Blocked'}</strong>
          </div>
          <p>{motionJudgement.label}</p>
          <ul>
            {motionJudgement.results.slice(0, 5).map((item) => (
              <li className={item.passed ? 'is-passing' : 'is-blocking'} key={item.id}>
                <span>{item.passed ? 'Pass' : 'Fail'}</span>
                <strong>{item.label}</strong>
                <em>{item.detail}</em>
              </li>
            ))}
          </ul>
        </section>

        <div className="bone-lab-probe">
          <strong>{selectedBone || 'No bone selected'}</strong>
          {selectedProfile ? (
            <p>
              {selectedProfile.side} {selectedProfile.region} · influence {selectedProfile.influence}
            </p>
          ) : null}
          <div>
            {(['x', 'y', 'z'] as Axis[]).map((axis) => (
              <button
                className={probe?.boneName === selectedBone && probe.axis === axis ? 'is-active' : ''}
                disabled={!selectedBone}
                key={axis}
                type="button"
                onClick={() => setProbe(selectedBone ? { boneName: selectedBone, axis } : null)}
              >
                Probe {axis.toUpperCase()}
              </button>
            ))}
            <button type="button" onClick={() => setProbe(null)}>
              Stop
            </button>
          </div>
        </div>

        <label className="bone-lab-search">
          <span>{boneNames.length} bones</span>
          <input placeholder="Filter bones" value={filter} onChange={(event) => setFilter(event.target.value)} />
        </label>

        <div className="bone-lab-list">
          {filteredBoneNames.map((boneName) => {
            const rotation = pose[boneName] ?? emptyRotation;
            const profile = boneProfiles[boneName];
            const limits = profile?.limits ?? getBoneLimits(boneName);

            return (
              <section
                className={[
                  boneName === selectedBone ? 'is-selected' : '',
                  testerBoneBlocklist.test(boneName) ? 'is-locked' : 'is-brain-safe',
                  'bone-row',
                ].join(' ')}
                key={boneName}
              >
                <button type="button" onClick={() => setSelectedBone(boneName)}>
                  {boneName}
                </button>
                {profile ? (
                  <p>
                    {profile.side} {profile.region} · influence {profile.influence}
                    {testerBoneBlocklist.test(boneName) ? ' · locked from brain/tester' : ' · brain-safe'}
                  </p>
                ) : null}
                {(['x', 'y', 'z'] as Axis[]).map((axis) => (
                  <label className="bone-axis" key={axis}>
                    <span>{axis.toUpperCase()}</span>
                    <input
                      max={limits[axis].max}
                      min={limits[axis].min}
                      step="1"
                      type="range"
                      value={rotation[axis]}
                      onChange={(event) => updateBoneAxis(boneName, axis, Number(event.target.value))}
                    />
                    <input
                      max={limits[axis].max}
                      min={limits[axis].min}
                      step="1"
                      type="number"
                      value={rotation[axis]}
                      onChange={(event) => updateBoneAxis(boneName, axis, Number(event.target.value))}
                    />
                  </label>
                ))}
              </section>
            );
          })}
        </div>
      </aside>
    </main>
  );
}
