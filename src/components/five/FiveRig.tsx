import { fiveRigParts } from '../../animation/five/fiveRigConfig';
import { motionClass, stateClass } from '../../animation/five/fiveMotion';
import type { FiveSceneMoment } from '../../animation/five/fiveRigTypes';
import { FivePart } from './FivePart';

type FiveRigProps = {
  moment: FiveSceneMoment;
  isBlinking: boolean;
};

export function FiveRig({ moment, isBlinking }: FiveRigProps) {
  return (
    <div
      className={[
        'five-rig',
        stateClass(moment.state),
        motionClass(moment.motion),
        isBlinking ? 'is-blinking' : '',
      ].join(' ')}
      aria-label={`Number 5 ${moment.state.toLowerCase()}`}
    >
      <div className="five-contact-shadow" />
      <div className="five-puppet">
        {fiveRigParts.map((part) => (
          <FivePart key={part.id} part={part} />
        ))}
      </div>
    </div>
  );
}
