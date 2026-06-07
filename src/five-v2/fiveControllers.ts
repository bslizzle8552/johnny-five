import { useEffect, useMemo, useState } from 'react';
import type { FiveV2Controller, FiveV2Mode, FiveV2Pose } from './fiveRigTypes';
import { createFiveV2BasePose } from './fiveRigManifest';
import { fiveV2StageConfig } from './fivePivots';
import { FiveArmController } from './fiveArmController';
import { FiveEyeController } from './fiveEyeController';
import { FiveGroundingController } from './fiveGroundingController';
import { FiveHeadController } from './fiveHeadController';
import { FiveIdleController } from './fiveIdleController';
import { FiveMotionController } from './fiveMotionController';
import { FiveTreadController } from './fiveTreadController';

const controllers: FiveV2Controller[] = [
  new FiveGroundingController(),
  new FiveMotionController(),
  new FiveIdleController(),
  new FiveEyeController(),
  new FiveHeadController(),
  new FiveArmController(),
  new FiveTreadController(),
];

export function computeFiveV2Pose(timeMs: number, deltaMs: number, mode: FiveV2Mode): FiveV2Pose {
  return controllers.reduce(
    (pose, controller) => controller.update(pose, { timeMs, deltaMs, mode, stage: fiveV2StageConfig }),
    createFiveV2BasePose(),
  );
}

export function useFiveV2Pose(mode: FiveV2Mode) {
  const [clock, setClock] = useState({ timeMs: 0, deltaMs: 16 });

  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      setClock({ timeMs: now, deltaMs: now - last });
      last = now;
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return useMemo(() => computeFiveV2Pose(clock.timeMs, clock.deltaMs, mode), [clock, mode]);
}
