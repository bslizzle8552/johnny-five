import { fiveStageConfig } from './fiveRigConfig';
import type { FiveSceneMoment } from './fiveRigTypes';

const floor = fiveStageConfig.floorY;

export const fiveTimeline: FiveSceneMoment[] = [
  { id: 'walk-right-01', state: 'Walk', motion: 'walk', groundX: 326, groundY: floor, facing: 1, durationMs: 900, travelMs: 900, look: { x: 8, y: -2 } },
  { id: 'walk-right-02', state: 'Walk', motion: 'walk', groundX: 386, groundY: floor, facing: 1, durationMs: 900, travelMs: 900, look: { x: 8, y: -2 } },
  { id: 'walk-right-03', state: 'Walk', motion: 'walk', groundX: 446, groundY: floor, facing: 1, durationMs: 900, travelMs: 900, look: { x: 7, y: -2 } },
  { id: 'walk-right-04', state: 'Walk', motion: 'walk', groundX: 506, groundY: floor, facing: 1, durationMs: 900, travelMs: 900, look: { x: 7, y: -2 } },
  { id: 'walk-right-05', state: 'Walk', motion: 'walk', groundX: 566, groundY: floor, facing: 1, durationMs: 900, travelMs: 900, look: { x: 6, y: -1 } },
  { id: 'walk-right-06', state: 'Walk', motion: 'walk', groundX: 626, groundY: floor, facing: 1, durationMs: 900, travelMs: 900, look: { x: 6, y: -1 } },
  { id: 'turn-left', state: 'TurnLeft', motion: 'turnLeft', groundX: 626, groundY: floor, facing: -1, durationMs: 1300, look: { x: -8, y: -1 } },
  { id: 'walk-left-01', state: 'Walk', motion: 'walk', groundX: 566, groundY: floor, facing: -1, durationMs: 900, travelMs: 900, look: { x: -8, y: -2 } },
  { id: 'walk-left-02', state: 'Walk', motion: 'walk', groundX: 506, groundY: floor, facing: -1, durationMs: 900, travelMs: 900, look: { x: -8, y: -2 } },
  { id: 'walk-left-03', state: 'Walk', motion: 'walk', groundX: 446, groundY: floor, facing: -1, durationMs: 900, travelMs: 900, look: { x: -7, y: -2 } },
  { id: 'walk-left-04', state: 'Walk', motion: 'walk', groundX: 386, groundY: floor, facing: -1, durationMs: 900, travelMs: 900, look: { x: -7, y: -2 } },
  { id: 'walk-left-05', state: 'Walk', motion: 'walk', groundX: 326, groundY: floor, facing: -1, durationMs: 900, travelMs: 900, look: { x: -6, y: -1 } },
  { id: 'turn-right', state: 'TurnRight', motion: 'turnRight', groundX: 326, groundY: floor, facing: 1, durationMs: 1300, look: { x: 8, y: -1 } },
];
