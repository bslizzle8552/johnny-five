import { fiveV2PartManifest } from '../../five-v2/fiveV2RigManifest';

const visiblePartIds = new Set([
  'left_tread_belt_00',
  'right_tread_belt_00',
  'left_tread_housing',
  'right_tread_housing',
  'chassis',
  'torso',
  'neck_mount',
  'head_bar',
  'left_eye_housing',
  'right_eye_housing',
  'left_lens',
  'right_lens',
  'left_eye_glow',
  'right_eye_glow',
  'left_shoulder_joint',
  'left_upper_arm',
  'left_lower_arm',
  'left_gripper',
  'right_shoulder_joint',
  'right_upper_arm',
  'right_lower_arm',
  'right_gripper',
  'red_toolbox',
  'indicator_light_amber',
]);

export function FiveV2StaticAssembly() {
  return (
    <section className="five-v2-static-review" aria-label="5 V2 static puppet assembly">
      <div className="five-v2-static-stage">
        {fiveV2PartManifest
          .filter((part) => visiblePartIds.has(part.id))
          .map((part) => (
            <img
              key={part.id}
              src={part.src}
              alt=""
              className={[
                'five-v2-static-part',
                part.id === 'head_bar' ? 'is-proof-head' : '',
                part.id === 'right_upper_arm' ? 'is-proof-arm' : '',
                part.id.includes('lens') || part.id.includes('glow') ? 'is-proof-eye' : '',
              ].join(' ')}
              style={{
                left: `${part.x}px`,
                top: `${part.y}px`,
                width: `${part.width}px`,
                height: `${part.height}px`,
                zIndex: part.zIndex,
                transformOrigin: `${part.pivotX}px ${part.pivotY}px`,
              }}
              draggable={false}
            />
          ))}
      </div>
    </section>
  );
}
