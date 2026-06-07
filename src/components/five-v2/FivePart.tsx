import type { FiveV2PartDefinition, FiveV2PartRenderStyle, FiveV2Transform } from '../../five-v2/fiveRigTypes';

type FivePartProps = {
  part: FiveV2PartDefinition;
  transform: FiveV2Transform;
};

export function FivePart({ part, transform }: FivePartProps) {
  if (!part.src) {
    return null;
  }

  const style: FiveV2PartRenderStyle = {
    '--part-x': `${part.x + transform.x}px`,
    '--part-y': `${part.y + transform.y}px`,
    '--part-width': `${part.width}px`,
    '--part-height': `${part.height}px`,
    '--part-pivot-x': `${part.pivotX}px`,
    '--part-pivot-y': `${part.pivotY}px`,
    '--part-z': part.zIndex,
    opacity: transform.opacity,
    transform: `rotate(${part.rotation + transform.rotation}deg) scale(${part.scaleX * transform.scaleX}, ${
      part.scaleY * transform.scaleY
    })`,
  };

  return (
    <img
      className={['five-v2-part', part.className ?? ''].join(' ')}
      src={part.src}
      alt=""
      draggable={false}
      style={style}
      data-part-id={part.id}
      data-parent-id={part.parentId ?? 'root'}
      aria-hidden="true"
    />
  );
}
