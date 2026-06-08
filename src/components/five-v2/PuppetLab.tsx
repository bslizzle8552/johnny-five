import { useMemo, useState } from 'react';
import { computeFiveBodyCommands } from '../../five-v2/fivePuppeteer';
import type { FiveIntent } from '../../five-v2/fiveIntentTypes';
import type { FiveV2Mode } from '../../five-v2/fiveRigTypes';
import { FivePuppetStage } from './FivePuppetStage';

type PuppetIntentOption = {
  id: string;
  label: string;
  mode: FiveV2Mode;
  intent: FiveIntent;
};

const puppetIntentOptions: PuppetIntentOption[] = [
  { id: 'rest', label: 'Rest', mode: 'idle', intent: { type: 'rest', energy: 0.35 } },
  { id: 'look-left', label: 'Look left', mode: 'idle', intent: { type: 'look', direction: 'left', intensity: 0.85 } },
  { id: 'look-right', label: 'Look right', mode: 'idle', intent: { type: 'look', direction: 'right', intensity: 0.85 } },
  { id: 'roll-forward', label: 'Roll forward', mode: 'roll-test', intent: { type: 'roll', direction: 'forward', speed: 0.55 } },
  { id: 'turn-left', label: 'Turn left', mode: 'turn-test', intent: { type: 'roll', direction: 'turn-left', speed: 0.5 } },
  { id: 'right-wave', label: 'Right wave', mode: 'idle', intent: { type: 'gesture', side: 'right', shape: 'wave', intensity: 0.85 } },
  { id: 'left-point', label: 'Left point', mode: 'idle', intent: { type: 'gesture', side: 'left', shape: 'point', intensity: 0.8 } },
];

export function PuppetLab() {
  const [activeOption, setActiveOption] = useState(puppetIntentOptions[0]);
  const commands = useMemo(() => computeFiveBodyCommands(activeOption.intent), [activeOption]);

  return (
    <main className="five-v2-lab" aria-label="Johnny Five V2 PuppetLab">
      <FivePuppetStage mode={activeOption.mode} commands={commands} />
      <aside className="five-v2-puppeteer-panel" aria-label="Digital puppeteer controls">
        <div className="five-v2-puppeteer-heading">
          <p>Digital puppeteer</p>
          <h1>Body command simulator</h1>
        </div>

        <div className="five-v2-intent-grid">
          {puppetIntentOptions.map((option) => (
            <button
              className={option.id === activeOption.id ? 'is-active' : ''}
              key={option.id}
              type="button"
              onClick={() => setActiveOption(option)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="five-v2-command-readout" aria-label="Current body commands">
          {commands.map((command) => (
            <div className="five-v2-command-row" key={command.actuatorId}>
              <span>{command.actuatorId}</span>
              <strong>{Math.round(command.value)}</strong>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}
