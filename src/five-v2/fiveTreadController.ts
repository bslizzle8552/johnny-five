import type { FiveV2Controller, FiveV2ControllerContext, FiveV2Pose } from './fiveRigTypes';

const leftFrames = ['left_tread_belt_00', 'left_tread_belt_01', 'left_tread_belt_02', 'left_tread_belt_03'];
const rightFrames = ['right_tread_belt_00', 'right_tread_belt_01', 'right_tread_belt_02', 'right_tread_belt_03'];

export class FiveTreadController implements FiveV2Controller {
  update(pose: FiveV2Pose, context: FiveV2ControllerContext) {
    const shouldCycle = context.mode === 'tread-test' || context.mode === 'roll-test' || context.mode === 'turn-test';
    const frame = shouldCycle ? Math.floor(context.timeMs / 120) % 4 : 0;

    leftFrames.forEach((id, index) => {
      pose.parts[id] = { ...pose.parts[id], opacity: index === frame ? 1 : 0 };
    });

    rightFrames.forEach((id, index) => {
      const rightFrame = context.mode === 'turn-test' ? 3 - frame : frame;
      pose.parts[id] = { ...pose.parts[id], opacity: index === rightFrame ? 1 : 0 };
    });

    return pose;
  }
}
