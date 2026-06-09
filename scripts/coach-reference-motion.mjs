import fs from 'node:fs';
import path from 'node:path';
import { analyzeFile } from './analyze-reference-motion.mjs';

const referenceDir = 'public/robot/reference_motion';
const outputDir = 'docs/motion-training';
const appProfilePath = 'src/components/robot/referenceMotionProfile.json';
const iterations = Number(process.argv.find((arg) => arg.startsWith('--iterations='))?.split('=')[1] ?? 1);
const passThreshold = 92;
const trainingBlendPerIteration = 0.035;

const objectiveWeights = {
  walk: {
    duration: 0.8,
    stridePhaseSpeed: 1.2,
    footPitchDelta: 0.9,
    toeCurlDelta: 0.9,
    upperArmSwingDelta: 1,
    forearmFlexDelta: 1,
  },
  turn: {
    duration: 1,
    detectedSteps: 1.1,
  },
  idle: {
    duration: 0.6,
  },
  wave: {
    averageDuration: 0.8,
  },
  dance: {
    averageDuration: 0.8,
  },
  longStep: {
    duration: 0.8,
    footPitchDelta: 0.8,
    toeCurlDelta: 0.7,
  },
  jab: {
    averageDuration: 0.8,
    leadArmReachDelta: 1.2,
    forearmSnapDelta: 1,
  },
  longStepJab: {
    averageDuration: 0.8,
  },
};

function average(values) {
  const usable = values.filter((value) => Number.isFinite(value));
  if (!usable.length) {
    return 0;
  }

  return usable.reduce((total, value) => total + value, 0) / usable.length;
}

function round(value, places = 3) {
  return Number(value.toFixed(places));
}

function motionIntent(fileName, clip) {
  const lowerName = fileName.toLowerCase();
  if (lowerName.includes('dance')) {
    return 'dance';
  }
  if (lowerName.includes('lead') && lowerName.includes('jab')) {
    return 'jab';
  }
  if (lowerName.includes('long') && lowerName.includes('step')) {
    return 'longStep';
  }
  if (lowerName.includes('turn') && lowerName.includes('180')) {
    return 'turn';
  }
  if (lowerName.includes('standard') && lowerName.includes('walk')) {
    return 'walk';
  }
  if (lowerName.includes('whats') || lowerName.includes('wave')) {
    return 'wave';
  }
  return clip.inferredType;
}

function readCurrentProfile() {
  if (!fs.existsSync(appProfilePath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(appProfilePath, 'utf8'));
}

function scoreValue(current, target) {
  if (!Number.isFinite(current) || !Number.isFinite(target)) {
    return 0;
  }

  if (target === 0) {
    return current === 0 ? 100 : Math.max(0, 100 * (1 - Math.abs(current)));
  }

  const normalizedError = Math.abs(current - target) / Math.max(Math.abs(target), 1);
  return Math.max(0, 100 * (1 - normalizedError));
}

function scoreProfile(profile, targetProfile) {
  const skillScores = {};
  let weightedTotal = 0;
  let totalWeight = 0;

  for (const [skill, weights] of Object.entries(objectiveWeights)) {
    const metrics = {};
    let skillWeightedTotal = 0;
    let skillTotalWeight = 0;

    for (const [metric, weight] of Object.entries(weights)) {
      const current = profile?.[skill]?.[metric];
      const target = targetProfile?.[skill]?.[metric];
      if (!Number.isFinite(target)) {
        continue;
      }

      const score = scoreValue(current, target);
      const error = Number.isFinite(current) ? current - target : null;
      metrics[metric] = {
        current: Number.isFinite(current) ? round(current) : null,
        target: round(target),
        error: error === null ? null : round(error),
        score: round(score, 1),
      };
      skillWeightedTotal += score * weight;
      skillTotalWeight += weight;
    }

    const skillScore = skillTotalWeight ? skillWeightedTotal / skillTotalWeight : 0;
    skillScores[skill] = {
      score: round(skillScore, 1),
      metrics,
    };
    weightedTotal += skillScore * skillTotalWeight;
    totalWeight += skillTotalWeight;
  }

  const overall = totalWeight ? weightedTotal / totalWeight : 0;

  return {
    overall: round(overall, 1),
    passThreshold,
    passes: overall >= passThreshold,
    skillScores,
  };
}

function trainProfile(currentProfile, targetProfile) {
  const trained = structuredClone(currentProfile);
  const blend = 1 - ((1 - trainingBlendPerIteration) ** Math.max(1, iterations));

  for (const [skill, weights] of Object.entries(objectiveWeights)) {
    trained[skill] ??= {};
    for (const metric of Object.keys(weights)) {
      const target = targetProfile?.[skill]?.[metric];
      if (!Number.isFinite(target)) {
        continue;
      }

      const current = Number.isFinite(trained[skill][metric]) ? trained[skill][metric] : target;
      trained[skill][metric] = round(current + (target - current) * blend);
    }
  }

  for (const [skill, values] of Object.entries(targetProfile)) {
    trained[skill] = {
      ...values,
      ...(trained[skill] ?? {}),
    };
  }

  if (Number.isFinite(targetProfile.turn?.detectedSteps)) {
    trained.turn.detectedSteps = Math.round(trained.turn.detectedSteps);
  }

  return trained;
}

function collectTargets(reports) {
  const clips = reports.flatMap((report) => report.animations.map((clip) => ({
    file: report.file,
    fileName: path.basename(report.file),
    intent: motionIntent(path.basename(report.file), clip),
    ...clip,
  })));
  const walkClips = clips.filter((clip) => clip.intent === 'walk');
  const turnClips = clips.filter((clip) => clip.intent === 'turn');
  const idleClips = clips.filter((clip) => clip.intent === 'idle');
  const waveClips = clips.filter((clip) => clip.intent === 'wave');
  const danceClips = clips.filter((clip) => clip.intent === 'dance');
  const longStepClips = clips.filter((clip) => clip.intent === 'longStep');
  const jabClips = clips.filter((clip) => clip.intent === 'jab');
  const longStepJabDuration = average([
    average(longStepClips.map((clip) => clip.duration)),
    average(jabClips.map((clip) => clip.duration)),
  ].filter((value) => value > 0));

  return {
    generatedAt: new Date().toISOString(),
    iterationsRequested: iterations,
    referenceFiles: reports.map((report) => report.file),
    clipInventory: clips.map((clip) => ({
      file: clip.fileName,
      index: clip.index,
      name: clip.name,
      inferredType: clip.inferredType,
      intent: clip.intent,
      duration: clip.duration,
      keyframes: clip.keyframes,
    })),
    recommendedProfile: {
      walk: {
        duration: round(average(walkClips.map((clip) => clip.duration))),
        stridePhaseSpeed: round(average(walkClips.map((clip) => {
          const stepSeconds = clip.recipe?.guidance?.estimatedStepSeconds;
          return stepSeconds ? Math.PI / stepSeconds * 2.65 : NaN;
        }))),
        footPitchDelta: round(average(walkClips.flatMap((clip) => [
          clip.recipe?.guidance?.lowerBody?.footPitchDelta?.left,
          clip.recipe?.guidance?.lowerBody?.footPitchDelta?.right,
        ]))),
        upperArmSwingDelta: round(average(walkClips.flatMap((clip) => [
          clip.recipe?.guidance?.upperBody?.upperArmSwingDelta?.left,
          clip.recipe?.guidance?.upperBody?.upperArmSwingDelta?.right,
        ]))),
        forearmFlexDelta: round(average(walkClips.flatMap((clip) => [
          clip.recipe?.guidance?.upperBody?.forearmFlexDelta?.left,
          clip.recipe?.guidance?.upperBody?.forearmFlexDelta?.right,
        ]))),
        toeCurlDelta: round(average(walkClips.flatMap((clip) => [
          clip.recipe?.guidance?.lowerBody?.toeCurlDelta?.left,
          clip.recipe?.guidance?.lowerBody?.toeCurlDelta?.right,
        ]))),
      },
      turn: {
        duration: round(average(turnClips.map((clip) => clip.duration))),
        detectedSteps: Math.max(1, Math.round(average(turnClips.map((clip) => clip.recipe?.guidance?.estimatedStepCount ?? NaN)))),
      },
      idle: {
        duration: round(average(idleClips.map((clip) => clip.duration))),
        keepMotionSmall: true,
      },
      wave: {
        references: waveClips.length,
        averageDuration: round(average(waveClips.map((clip) => clip.duration))),
      },
      dance: {
        references: danceClips.length,
        averageDuration: round(average(danceClips.map((clip) => clip.duration))),
      },
      longStep: {
        references: longStepClips.length,
        duration: round(average(longStepClips.map((clip) => clip.duration))),
        footPitchDelta: round(average(longStepClips.flatMap((clip) => [
          clip.recipe?.guidance?.lowerBody?.footPitchDelta?.left,
          clip.recipe?.guidance?.lowerBody?.footPitchDelta?.right,
        ]))),
        toeCurlDelta: round(average(longStepClips.flatMap((clip) => [
          clip.recipe?.guidance?.lowerBody?.toeCurlDelta?.left,
          clip.recipe?.guidance?.lowerBody?.toeCurlDelta?.right,
        ]))),
      },
      jab: {
        references: jabClips.length,
        averageDuration: round(average(jabClips.map((clip) => clip.duration))),
        leadArmReachDelta: round(average(jabClips.flatMap((clip) => [
          clip.bones?.L_Upperarm?.rotationRange?.[0]?.delta,
          clip.bones?.R_Upperarm?.rotationRange?.[0]?.delta,
        ]))),
        forearmSnapDelta: round(average(jabClips.flatMap((clip) => [
          clip.bones?.L_Forearm?.rotationRange?.[0]?.delta,
          clip.bones?.R_Forearm?.rotationRange?.[0]?.delta,
        ]))),
      },
      longStepJab: {
        references: longStepClips.length && jabClips.length ? Math.min(longStepClips.length, jabClips.length) : 0,
        averageDuration: round(longStepJabDuration),
      },
    },
    gradingNotes: [
      'This is an objective motion report, not canned playback.',
      'Use the profile values to tune procedural skills, then verify visually.',
      'A future scoring loop can compare Johnny-generated samples against these targets frame-by-frame.',
    ],
  };
}

const glbFiles = fs.readdirSync(referenceDir)
  .filter((fileName) => ['.glb', '.fbx'].includes(path.extname(fileName).toLowerCase()))
  .map((fileName) => path.join(referenceDir, fileName));

if (!glbFiles.length) {
  throw new Error(`No GLB reference files found in ${referenceDir}`);
}

const reports = glbFiles.map((file) => analyzeFile(file));
const coachingReport = collectTargets(reports);
const currentProfile = readCurrentProfile();
const targetProfile = coachingReport.recommendedProfile;
const trainedProfile = trainProfile(currentProfile, targetProfile);
const currentScore = scoreProfile(currentProfile, targetProfile);
const trainedScore = scoreProfile(trainedProfile, targetProfile);

coachingReport.objective = {
  goal: 'Make Johnny procedural motion as close as possible to the provided reference animations without playing canned animation clips.',
  passThreshold,
  weights: objectiveWeights,
  currentScore,
  trainedScore,
};
coachingReport.recommendedProfile = trainedProfile;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'reference-motion-report.json'), `${JSON.stringify({ reports, coachingReport }, null, 2)}\n`);
fs.writeFileSync(path.join(outputDir, 'target-motion-profile.json'), `${JSON.stringify(targetProfile, null, 2)}\n`);
fs.writeFileSync(path.join(outputDir, 'recommended-motion-profile.json'), `${JSON.stringify(trainedProfile, null, 2)}\n`);
fs.writeFileSync(path.join(outputDir, 'motion-objective-score.json'), `${JSON.stringify(coachingReport.objective, null, 2)}\n`);
fs.writeFileSync(appProfilePath, `${JSON.stringify(trainedProfile, null, 2)}\n`);

console.log(JSON.stringify(coachingReport, null, 2));
