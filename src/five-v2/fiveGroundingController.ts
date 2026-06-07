import type { FiveV2Controller, FiveV2ControllerContext, FiveV2Pose } from './fiveRigTypes';

export class FiveGroundingController implements FiveV2Controller {
  update(pose: FiveV2Pose, context: FiveV2ControllerContext) {
    pose.root.groundY = context.stage.floorY;

    for (const id of ['left_tread_housing', 'right_tread_housing']) {
      pose.parts[id] = { ...pose.parts[id], y: 0, rotation: 0 };
    }

    return pose;
  }
}
