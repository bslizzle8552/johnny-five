import type { CSSProperties } from 'react';
import { fiveStageConfig } from './fiveRigConfig';
import type { FiveSceneMoment } from './fiveRigTypes';

export function getFiveRootStyle(moment: FiveSceneMoment): CSSProperties {
  return {
    '--five-ground-x': `${moment.groundX}px`,
    '--five-ground-y': `${moment.groundY}px`,
    '--five-ground-x-pct': `${(moment.groundX / fiveStageConfig.stageWidth) * 100}%`,
    '--five-ground-y-pct': `${(moment.groundY / fiveStageConfig.stageHeight) * 100}%`,
    '--five-ground-local-x': `${fiveStageConfig.five.groundLocalX}px`,
    '--five-ground-local-y': `${fiveStageConfig.five.groundLocalY}px`,
    '--five-width': `${fiveStageConfig.five.rigWidth}px`,
    '--five-height': `${fiveStageConfig.five.rigHeight}px`,
    '--travel-time': `${moment.travelMs ?? Math.max(1200, moment.durationMs - 500)}ms`,
    '--look-x': `${moment.look.x}px`,
    '--look-y': `${moment.look.y}px`,
    '--facing': moment.facing,
  } as CSSProperties;
}

export function getStageStyle(): CSSProperties {
  return {
    '--stage-width': `${fiveStageConfig.stageWidth}px`,
    '--stage-height': `${fiveStageConfig.stageHeight}px`,
    '--floor-y': `${fiveStageConfig.floorY}px`,
    '--floor-y-pct': `${(fiveStageConfig.floorY / fiveStageConfig.stageHeight) * 100}%`,
    '--dock-target-x': `${fiveStageConfig.charger.dockTargetX}px`,
    '--dock-target-y': `${fiveStageConfig.charger.dockTargetY}px`,
    '--dock-left-pct': `${((fiveStageConfig.charger.dockTargetX - fiveStageConfig.charger.padWidth / 2) / fiveStageConfig.stageWidth) * 100}%`,
    '--dock-top-pct': `${((fiveStageConfig.charger.dockTargetY - 20) / fiveStageConfig.stageHeight) * 100}%`,
    '--dock-pad-width': `${fiveStageConfig.charger.padWidth}px`,
    '--dock-pad-width-pct': `${(fiveStageConfig.charger.padWidth / fiveStageConfig.stageWidth) * 100}%`,
  } as CSSProperties;
}

export function stateClass(state: FiveSceneMoment['state']): string {
  return `state-${state.toLowerCase()}`;
}

export function motionClass(motion: FiveSceneMoment['motion']): string {
  return `motion-${motion.toLowerCase()}`;
}
