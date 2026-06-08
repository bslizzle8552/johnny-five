export type FiveLookDirection = 'center' | 'left' | 'right' | 'up' | 'down';

export type FiveArmSide = 'left' | 'right';

export type FiveMovementDirection = 'stop' | 'forward' | 'backward' | 'turn-left' | 'turn-right';

export type FiveIntent =
  | {
      type: 'rest';
      energy?: number;
    }
  | {
      type: 'look';
      direction: FiveLookDirection;
      intensity?: number;
    }
  | {
      type: 'roll';
      direction: FiveMovementDirection;
      speed?: number;
    }
  | {
      type: 'gesture';
      side: FiveArmSide;
      shape: 'relaxed' | 'point' | 'wave' | 'open-hand';
      intensity?: number;
    };
