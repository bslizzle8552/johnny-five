import type { CSSProperties } from 'react';
import type { FivePartDefinition } from '../../animation/five/fiveRigTypes';

type FivePartProps = {
  part: FivePartDefinition;
};

export function FivePart({ part }: FivePartProps) {
  const style = {
    '--part-x': `${part.x}px`,
    '--part-y': `${part.y}px`,
    '--part-w': `${part.width}px`,
    '--part-h': `${part.height}px`,
    '--part-pivot-x': `${part.pivotX}px`,
    '--part-pivot-y': `${part.pivotY}px`,
    '--part-z': part.z,
    ...part.style,
  } as CSSProperties;

  const classes = ['five-part', `part-${part.id}`, part.className ?? ''].join(' ');

  return (
    <div className={classes} style={style} aria-hidden="true">
      {part.className?.includes('belt') ? (
        <div className="belt-window">
          <img src={part.src} alt="" draggable={false} />
          <img src={part.src} alt="" draggable={false} />
        </div>
      ) : (
        <img src={part.src} alt="" draggable={false} />
      )}
    </div>
  );
}
