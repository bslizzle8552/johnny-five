import { fiveV2PartManifest } from '../../five-v2/fiveRigManifest';
import { fiveV2RigBounds } from '../../five-v2/fivePivots';
import { useFiveV2Pose } from '../../five-v2/fiveControllers';
import type { FiveV2Mode } from '../../five-v2/fiveRigTypes';
import { FivePart } from './FivePart';

type FivePuppetProps = {
  mode: FiveV2Mode;
};

export function FivePuppet({ mode }: FivePuppetProps) {
  const pose = useFiveV2Pose(mode);
  const rootStyle = {
    left: `${pose.root.groundX}px`,
    top: `${pose.root.groundY}px`,
    width: `${fiveV2RigBounds.width}px`,
    height: `${fiveV2RigBounds.height}px`,
    transform: `translate(${-fiveV2RigBounds.groundLocalX}px, ${-fiveV2RigBounds.groundLocalY}px) scaleX(${pose.root.facing})`,
  };

  return (
    <div className="five-v2-root" style={rootStyle} aria-label="Johnny Five V2 puppet">
      <div className="five-v2-contact-shadow" aria-hidden="true" />
      {fiveV2PartManifest.map((part) => (
        <FivePart key={part.id} part={part} transform={pose.parts[part.id]} />
      ))}
    </div>
  );
}
