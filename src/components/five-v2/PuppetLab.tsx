import { useEffect, useState } from 'react';
import type { FiveV2Mode } from '../../five-v2/fiveRigTypes';
import { FivePuppetStage } from './FivePuppetStage';

const modeCycle: FiveV2Mode[] = ['idle', 'tread-test', 'roll-test', 'turn-test'];

export function PuppetLab() {
  const [mode, setMode] = useState<FiveV2Mode>('idle');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMode((current) => modeCycle[(modeCycle.indexOf(current) + 1) % modeCycle.length]);
    }, 9000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="five-v2-lab" aria-label="Johnny Five V2 PuppetLab">
      <FivePuppetStage mode={mode} />
    </main>
  );
}
