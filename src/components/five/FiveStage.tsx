import { useMemo } from 'react';
import { useFiveController } from '../../animation/five/fiveControllers';
import { getFiveRootStyle, getStageStyle } from '../../animation/five/fiveMotion';
import { FiveRig } from './FiveRig';

export function FiveStage() {
  const { moment, isBlinking } = useFiveController();
  const stageStyle = useMemo(() => getStageStyle(), []);
  const fiveStyle = useMemo(() => getFiveRootStyle(moment), [moment]);

  return (
    <section className="five-stage" style={stageStyle} aria-label="Johnny walking lab">
      <div className="five-root" style={fiveStyle}>
        <FiveRig moment={moment} isBlinking={isBlinking} />
      </div>
    </section>
  );
}
