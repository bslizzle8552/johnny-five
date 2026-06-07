import type { FiveV2StageConfig } from './fiveRigTypes';

export const fiveV2StageConfig: FiveV2StageConfig = {
  stageWidth: 1024,
  stageHeight: 576,
  floorY: 460,
  fiveGroundX: 512,
  fiveGroundY: 460,
  fiveFacing: 1,
  baseCenterPoint: { x: 0, y: -72 },
  leftTreadContactPoint: { x: -82, y: 0 },
  rightTreadContactPoint: { x: 82, y: 0 },
};

export const fiveV2RigBounds = {
  width: 320,
  height: 430,
  groundLocalX: 160,
  groundLocalY: 390,
};
