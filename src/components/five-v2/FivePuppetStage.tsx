import type { CSSProperties } from 'react';
import type { FiveBodyCommand } from '../../five-v2/fiveBodyModel';
import { hasCompleteFiveV2AssetKit, missingFiveV2Assets } from '../../five-v2/fiveRigManifest';
import { fiveV2StageConfig } from '../../five-v2/fivePivots';
import type { FiveV2Mode } from '../../five-v2/fiveRigTypes';
import { FivePuppet } from './FivePuppet';

type FivePuppetStageProps = {
  mode: FiveV2Mode;
  commands: FiveBodyCommand[];
};

export function FivePuppetStage({ mode, commands }: FivePuppetStageProps) {
  const stageStyle = {
    '--five-v2-stage-width': `${fiveV2StageConfig.stageWidth}px`,
    '--five-v2-stage-height': `${fiveV2StageConfig.stageHeight}px`,
    '--five-v2-floor-y': `${fiveV2StageConfig.floorY}px`,
  } as CSSProperties;

  return (
    <section className="five-v2-stage" style={stageStyle} aria-label="Johnny Five V2 puppet lab">
      <div className="five-v2-wall" />
      <div className="five-v2-floor" />
      <div className="five-v2-floor-line" />
      {hasCompleteFiveV2AssetKit ? (
        <FivePuppet mode={mode} commands={commands} />
      ) : (
        <div className="five-v2-missing" role="status">
          <p>V2 puppet assets missing. See docs/five-v2-asset-manifest.md.</p>
          <span>{missingFiveV2Assets.length} required transparent PNG parts missing.</span>
        </div>
      )}
    </section>
  );
}
