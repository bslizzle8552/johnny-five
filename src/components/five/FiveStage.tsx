import { useMemo } from 'react';
import { useFiveController } from '../../animation/five/fiveControllers';
import { getFiveRootStyle, getStageStyle } from '../../animation/five/fiveMotion';
import { FiveRig } from './FiveRig';

export function FiveStage() {
  const { moment, speech, isBlinking } = useFiveController();
  const stageStyle = useMemo(() => getStageStyle(), []);
  const fiveStyle = useMemo(() => getFiveRootStyle(moment), [moment]);
  const isCharging = moment.state === 'Charge' || moment.state === 'Sleep';

  return (
    <section className="five-stage" style={stageStyle} aria-label="Number 5 floor coordinate test stage">
      <div className="stage-wall" />
      <div className="stage-floor" />
      <div className={['charging-pad', isCharging ? 'is-active' : ''].join(' ')} aria-hidden="true">
        <span className="dock-target" />
      </div>
      <div className="five-root" style={fiveStyle}>
        <FiveRig moment={moment} speech={speech} isBlinking={isBlinking} />
      </div>
    </section>
  );
}
