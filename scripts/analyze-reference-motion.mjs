import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const componentSize = {
  5126: 4,
};

const typeCount = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT4: 16,
};

function readGlb(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.toString('utf8', 0, 4) !== 'glTF') {
    throw new Error(`${file} is not a binary glTF/glb file`);
  }

  let json = null;
  let bin = null;
  let offset = 12;
  while (offset < buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.toString('utf8', offset + 4, offset + 8);
    const start = offset + 8;
    if (chunkType === 'JSON') {
      json = JSON.parse(buffer.toString('utf8', start, start + chunkLength));
    }
    if (chunkType === 'BIN\0') {
      bin = buffer.subarray(start, start + chunkLength);
    }
    offset = start + chunkLength;
  }

  if (!json || !bin) {
    throw new Error(`${file} is missing JSON or BIN chunks`);
  }

  return { json, bin };
}

function accessorValues(json, bin, index) {
  const accessor = json.accessors[index];
  const bufferView = json.bufferViews[accessor.bufferView];
  const components = typeCount[accessor.type];
  const stride = bufferView.byteStride || components * componentSize[accessor.componentType];
  const start = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
  const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
  const values = [];

  if (accessor.componentType !== 5126) {
    throw new Error(`Unsupported accessor component type ${accessor.componentType}`);
  }

  for (let i = 0; i < accessor.count; i += 1) {
    const row = [];
    for (let c = 0; c < components; c += 1) {
      row.push(view.getFloat32(start + i * stride + c * 4, true));
    }
    values.push(components === 1 ? row[0] : row);
  }

  return values;
}

function range(values) {
  if (!values.length) {
    return { min: 0, max: 0, delta: 0 };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  return {
    min: Number(min.toFixed(3)),
    max: Number(max.toFixed(3)),
    delta: Number((max - min).toFixed(3)),
  };
}

function vectorRanges(rows) {
  if (!rows.length) {
    return [];
  }
  const components = Array.isArray(rows[0]) ? rows[0].length : 1;
  return Array.from({ length: components }, (_, component) => {
    const values = rows.map((row) => (Array.isArray(row) ? row[component] : row));
    return range(values);
  });
}

function quatToEulerDegrees(value) {
  const quaternion = new THREE.Quaternion(value[0], value[1], value[2], value[3]);
  const euler = new THREE.Euler().setFromQuaternion(quaternion, 'XYZ');
  return [
    THREE.MathUtils.radToDeg(euler.x),
    THREE.MathUtils.radToDeg(euler.y),
    THREE.MathUtils.radToDeg(euler.z),
  ];
}

function rotationRanges(quaternions) {
  return vectorRanges(quaternions.map(quatToEulerDegrees));
}

function sampleRotation(quaternions, t) {
  const index = Math.max(0, Math.min(quaternions.length - 1, Math.round((quaternions.length - 1) * t)));
  const [x, y, z] = quatToEulerDegrees(quaternions[index]);
  return {
    x: Number(x.toFixed(1)),
    y: Number(y.toFixed(1)),
    z: Number(z.toFixed(1)),
  };
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function summarizeEvents(times, values, minimumDistanceSeconds = 0.35) {
  if (!times.length || !values.length) {
    return [];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const threshold = min + (max - min) * 0.62;
  const events = [];

  for (let i = 1; i < values.length - 1; i += 1) {
    const isPeak = values[i] >= threshold && values[i] >= values[i - 1] && values[i] >= values[i + 1];
    const farEnough = events.length === 0 || times[i] - events[events.length - 1].time >= minimumDistanceSeconds;
    if (isPeak && farEnough) {
      events.push({
        time: Number(times[i].toFixed(3)),
        value: Number(values[i].toFixed(1)),
      });
    }
  }

  return events;
}

function summarizeMotionRecipe(channels, bones, inferredType, duration) {
  const recipe = {
    type: inferredType,
    duration,
    footPushOffs: {},
    guidance: {},
  };

  for (const side of ['L', 'R']) {
    const toe = findChannel(channels, `${side}_ToeBase`, 'rotation');
    if (!toe) {
      continue;
    }

    const toeX = toe.output.map((rotation) => quatToEulerDegrees(rotation)[0]);
    const events = summarizeEvents(toe.input, toeX);
    recipe.footPushOffs[side === 'L' ? 'left' : 'right'] = {
      count: events.length,
      events,
      averageInterval: Number(average(events.slice(1).map((event, index) => event.time - events[index].time)).toFixed(3)),
    };
  }

  if (inferredType === 'walk') {
    const leftToe = recipe.footPushOffs.left?.events ?? [];
    const rightToe = recipe.footPushOffs.right?.events ?? [];
    const allEvents = [...leftToe, ...rightToe].sort((a, b) => a.time - b.time);
    const intervals = allEvents.slice(1).map((event, index) => event.time - allEvents[index].time);
    recipe.guidance = {
      estimatedStepSeconds: Number(average(intervals).toFixed(3)),
      estimatedSteps: allEvents.length,
      lowerBody: {
        footPitchDelta: {
          left: bones.L_Foot?.rotationRange?.[0]?.delta ?? null,
          right: bones.R_Foot?.rotationRange?.[0]?.delta ?? null,
        },
        toeCurlDelta: {
          left: bones.L_ToeBase?.rotationRange?.[0]?.delta ?? null,
          right: bones.R_ToeBase?.rotationRange?.[0]?.delta ?? null,
        },
      },
      upperBody: {
        upperArmSwingDelta: {
          left: bones.L_Upperarm?.rotationRange?.[0]?.delta ?? null,
          right: bones.R_Upperarm?.rotationRange?.[0]?.delta ?? null,
        },
        forearmFlexDelta: {
          left: bones.L_Forearm?.rotationRange?.[0]?.delta ?? null,
          right: bones.R_Forearm?.rotationRange?.[0]?.delta ?? null,
        },
      },
    };
  }

  if (inferredType === 'turn') {
    recipe.guidance = {
      estimatedStepCount: Object.values(recipe.footPushOffs).reduce((total, item) => total + item.count, 0),
      rootTurnDegrees: Number((Math.abs(channels.find((channel) => channel.nodeName === 'Root' && channel.path === 'rotation')
        ? rotationRanges(channels.find((channel) => channel.nodeName === 'Root' && channel.path === 'rotation').output)[2].delta
        : 0)).toFixed(1)),
    };
  }

  if (inferredType === 'idle') {
    recipe.guidance = {
      armRestSamples: {
        leftUpperarm: bones.L_Upperarm?.samples?.start ?? null,
        leftForearm: bones.L_Forearm?.samples?.start ?? null,
        rightUpperarm: bones.R_Upperarm?.samples?.start ?? null,
        rightForearm: bones.R_Forearm?.samples?.start ?? null,
      },
      keepIdleMotionSmall: true,
    };
  }

  return recipe;
}

function getChannels(json, bin, animation) {
  return animation.channels.map((channel) => {
    const sampler = animation.samplers[channel.sampler];
    return {
      nodeName: json.nodes[channel.target.node]?.name ?? `node_${channel.target.node}`,
      path: channel.target.path,
      input: accessorValues(json, bin, sampler.input),
      output: accessorValues(json, bin, sampler.output),
    };
  });
}

function findChannel(channels, nodeName, path) {
  return channels.find((channel) => channel.nodeName === nodeName && channel.path === path);
}

function classifyClip(summary) {
  const rootRotation = summary.root?.rotation?.[2]?.delta ?? 0;
  const rootTranslation = Math.max(...(summary.root?.translation ?? [{ delta: 0 }]).map((item) => item.delta));
  const duration = summary.duration;

  if (rootRotation > 180) {
    return 'turn';
  }

  if (duration > 6 || rootTranslation > 0.5) {
    return 'walk';
  }

  return 'idle';
}

function analyzeClip(json, bin, animation, animationIndex) {
  const channels = getChannels(json, bin, animation);
  const times = channels[0]?.input ?? [0];
  const duration = Math.max(...times);
  const bones = ['L_Upperarm', 'L_Forearm', 'L_Hand', 'R_Upperarm', 'R_Forearm', 'R_Hand', 'L_Foot', 'R_Foot', 'L_ToeBase', 'R_ToeBase'];
  const boneSummaries = {};

  for (const boneName of bones) {
    const rotation = findChannel(channels, boneName, 'rotation');
    if (!rotation) {
      continue;
    }
    boneSummaries[boneName] = {
      rotationRange: rotationRanges(rotation.output),
      samples: {
        start: sampleRotation(rotation.output, 0),
        quarter: sampleRotation(rotation.output, 0.25),
        half: sampleRotation(rotation.output, 0.5),
        threeQuarter: sampleRotation(rotation.output, 0.75),
        end: sampleRotation(rotation.output, 1),
      },
    };
  }

  const rootTranslation = findChannel(channels, 'Root', 'translation');
  const rootRotation = findChannel(channels, 'Root', 'rotation');
  const root = {
    translation: rootTranslation ? vectorRanges(rootTranslation.output) : null,
    rotation: rootRotation ? rotationRanges(rootRotation.output) : null,
  };
  const summary = {
    index: animationIndex,
    name: animation.name || `animation_${animationIndex}`,
    duration: Number(duration.toFixed(3)),
    keyframes: times.length,
    root,
    bones: boneSummaries,
  };

  const inferredType = classifyClip(summary);

  return {
    ...summary,
    inferredType,
    recipe: summarizeMotionRecipe(channels, boneSummaries, inferredType, summary.duration),
  };
}

function getTrack(animation, boneNames, property) {
  return animation.tracks.find((track) => {
    const [trackBoneName, trackProperty] = track.name.split('.');
    return boneNames.includes(trackBoneName) && trackProperty === property;
  });
}

function trackRows(track) {
  if (!track) {
    return [];
  }

  const values = Array.from(track.values);
  const components = track.getValueSize();
  const rows = [];
  for (let i = 0; i < values.length; i += components) {
    rows.push(values.slice(i, i + components));
  }
  return rows;
}

function analyzeFbxAnimation(animation, animationIndex) {
  const aliases = {
    L_Upperarm: ['mixamorigLeftArm'],
    L_Forearm: ['mixamorigLeftForeArm'],
    L_Hand: ['mixamorigLeftHand'],
    R_Upperarm: ['mixamorigRightArm'],
    R_Forearm: ['mixamorigRightForeArm'],
    R_Hand: ['mixamorigRightHand'],
    L_Foot: ['mixamorigLeftFoot'],
    R_Foot: ['mixamorigRightFoot'],
    L_ToeBase: ['mixamorigLeftToeBase'],
    R_ToeBase: ['mixamorigRightToeBase'],
  };
  const boneSummaries = {};

  for (const [canonicalName, boneNames] of Object.entries(aliases)) {
    const track = getTrack(animation, boneNames, 'quaternion');
    const rows = trackRows(track);
    if (!rows.length) {
      continue;
    }

    boneSummaries[canonicalName] = {
      rotationRange: rotationRanges(rows),
      samples: {
        start: sampleRotation(rows, 0),
        quarter: sampleRotation(rows, 0.25),
        half: sampleRotation(rows, 0.5),
        threeQuarter: sampleRotation(rows, 0.75),
        end: sampleRotation(rows, 1),
      },
    };
  }

  const rootTranslation = getTrack(animation, ['mixamorigHips'], 'position');
  const rootRotation = getTrack(animation, ['mixamorigHips'], 'quaternion');
  const root = {
    translation: rootTranslation ? vectorRanges(trackRows(rootTranslation)) : null,
    rotation: rootRotation ? rotationRanges(trackRows(rootRotation)) : null,
  };
  const summary = {
    index: animationIndex,
    name: animation.name || `animation_${animationIndex}`,
    duration: Number(animation.duration.toFixed(3)),
    keyframes: animation.tracks[0]?.times?.length ?? 0,
    root,
    bones: boneSummaries,
  };
  const inferredType = classifyClip(summary);
  const reverseAliases = Object.fromEntries(Object.entries(aliases).flatMap(([canonicalName, boneNames]) => (
    boneNames.map((boneName) => [boneName, canonicalName])
  )));
  const channels = animation.tracks.map((track) => {
    const [nodeName, property] = track.name.split('.');
    return {
      nodeName: reverseAliases[nodeName] ?? nodeName,
      path: property === 'quaternion' ? 'rotation' : property,
      input: Array.from(track.times),
      output: trackRows(track),
    };
  });

  return {
    ...summary,
    inferredType,
    recipe: summarizeMotionRecipe(channels, boneSummaries, inferredType, summary.duration),
  };
}

function analyzeFbxFile(inputFile) {
  const buffer = fs.readFileSync(inputFile);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const object = new FBXLoader().parse(arrayBuffer, path.dirname(inputFile));
  const bones = [];
  object.traverse((child) => {
    if (child.isBone) {
      bones.push(child.name);
    }
  });

  return {
    file: inputFile,
    format: 'fbx',
    nodeCount: bones.length,
    animations: object.animations.map((animation, index) => analyzeFbxAnimation(animation, index)),
  };
}

function analyzeGlbFile(inputFile) {
  const { json, bin } = readGlb(inputFile);
  return {
    file: inputFile,
    format: 'glb',
    nodeCount: json.nodes?.length ?? 0,
    animations: (json.animations ?? []).map((animation, index) => analyzeClip(json, bin, animation, index)),
  };
}

export function analyzeFile(inputFile) {
  const extension = path.extname(inputFile).toLowerCase();
  if (extension === '.fbx') {
    return analyzeFbxFile(inputFile);
  }
  return analyzeGlbFile(inputFile);
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  const inputFile = process.argv[2] ?? 'public/robot/reference_motion/walk_turn_idle_reference.glb';
  console.log(JSON.stringify(analyzeFile(inputFile), null, 2));
}
