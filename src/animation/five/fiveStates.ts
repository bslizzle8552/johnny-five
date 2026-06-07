import { fiveStageConfig } from './fiveRigConfig';
import type { FiveSceneMoment } from './fiveRigTypes';

const floor = fiveStageConfig.floorY;
const dockX = fiveStageConfig.charger.dockTargetX;

export const fiveTimeline: FiveSceneMoment[] = [
  { id: 'wake', state: 'Wake', motion: 'settle', groundX: 438, groundY: floor, facing: 1, durationMs: 5200, look: { x: 5, y: -8 }, speech: 'Number 5 is alive!', speechDelayMs: 1800 },
  { id: 'idle-observe', state: 'Idle', motion: 'still', groundX: 438, groundY: floor, facing: 1, durationMs: 15000, look: { x: 0, y: -1 } },
  { id: 'look-left', state: 'LookAround', motion: 'still', groundX: 438, groundY: floor, facing: 1, durationMs: 7600, look: { x: -9, y: -3 } },
  { id: 'look-right', state: 'LookAround', motion: 'still', groundX: 438, groundY: floor, facing: 1, durationMs: 9200, look: { x: 9, y: -2 }, speech: 'Interesting.', speechDelayMs: 5800 },
  { id: 'turn-right', state: 'TurnRight', motion: 'turnRight', groundX: 438, groundY: floor, facing: 1, durationMs: 3200, look: { x: 10, y: 0 } },
  { id: 'investigate', state: 'Investigate', motion: 'still', groundX: 438, groundY: floor, facing: 1, durationMs: 11200, look: { x: 8, y: 6 }, speech: 'Investigation required.', speechDelayMs: 6500 },
  { id: 'roll-out', state: 'Roll', motion: 'roll', groundX: 684, groundY: floor, facing: 1, durationMs: 8200, travelMs: 7800, look: { x: 10, y: -1 } },
  { id: 'read', state: 'Read', motion: 'still', groundX: 684, groundY: floor, facing: 1, durationMs: 16000, look: { x: 5, y: 7 }, speech: 'Acquiring new information.', speechDelayMs: 6400 },
  { id: 'turn-back', state: 'TurnLeft', motion: 'turnLeft', groundX: 684, groundY: floor, facing: -1, durationMs: 3400, look: { x: -10, y: 0 } },
  { id: 'return-scan', state: 'Roll', motion: 'slowRoll', groundX: 558, groundY: floor, facing: -1, durationMs: 6400, travelMs: 6000, look: { x: -8, y: 4 } },
  { id: 'low-power', state: 'LookAround', motion: 'still', groundX: 558, groundY: floor, facing: -1, durationMs: 6400, look: { x: -9, y: 0 }, speech: 'Processing.', speechDelayMs: 4300 },
  { id: 'charger-approach', state: 'Roll', motion: 'roll', groundX: dockX + 58, groundY: floor, facing: -1, durationMs: 9800, travelMs: 9300, look: { x: -10, y: 1 } },
  { id: 'charger-slow', state: 'Roll', motion: 'slowRoll', groundX: dockX + 14, groundY: floor, facing: -1, durationMs: 4300, travelMs: 3900, look: { x: -5, y: 2 } },
  { id: 'charger-align', state: 'Charge', motion: 'align', groundX: dockX + 4, groundY: floor, facing: -1, durationMs: 3200, travelMs: 2900, look: { x: -2, y: 2 } },
  { id: 'charger-dock', state: 'Charge', motion: 'dock', groundX: dockX, groundY: floor, facing: -1, durationMs: 3200, travelMs: 2600, look: { x: 0, y: 2 } },
  { id: 'charge', state: 'Charge', motion: 'still', groundX: dockX, groundY: floor, facing: -1, durationMs: 12000, look: { x: 0, y: 1 }, speech: 'Power levels increasing.', speechDelayMs: 4800 },
  { id: 'sleep-settle', state: 'Sleep', motion: 'settle', groundX: dockX, groundY: floor, facing: -1, durationMs: 4800, look: { x: 0, y: 0 } },
  { id: 'sleep', state: 'Sleep', motion: 'still', groundX: dockX, groundY: floor, facing: -1, durationMs: 15000, look: { x: 0, y: 0 }, speech: 'Sleep mode.', speechDelayMs: 3600 },
  { id: 'wake-again', state: 'Wake', motion: 'settle', groundX: dockX, groundY: floor, facing: -1, durationMs: 5400, look: { x: 3, y: -7 } },
  { id: 'roll-off-pad', state: 'Roll', motion: 'slowRoll', groundX: dockX + 82, groundY: floor, facing: 1, durationMs: 4800, travelMs: 4300, look: { x: 8, y: -1 } },
  { id: 'center', state: 'Idle', motion: 'settle', groundX: 438, groundY: floor, facing: 1, durationMs: 8200, look: { x: 1, y: -1 }, speech: 'Need input.', speechDelayMs: 6200 },
];
