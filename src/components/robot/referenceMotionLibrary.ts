export type ReferenceMotionPrinciple = {
  id: string;
  source: string;
  behavior: string;
  principle: string;
  validator: string;
};

export const referenceMotionLibrary: ReferenceMotionPrinciple[] = [
  {
    id: 'humanoid-sit-knees-forward',
    source: 'Humanoid robot crouch/sit references',
    behavior: 'sit',
    principle: 'A seated humanoid folds at hips and knees with feet staying below the knees; the shin does not invert backward.',
    validator: 'feet-below-knees and knee-bend-direction',
  },
  {
    id: 'manipulation-contact-before-ownership',
    source: 'Humanoid robot manipulation references',
    behavior: 'pick-up',
    principle: 'The hand reaches the object before the object becomes attached to the hand.',
    validator: 'held-object-hand-distance',
  },
  {
    id: 'body-faces-affordance',
    source: 'Humanoid approach and sit references',
    behavior: 'chair/object approach',
    principle: 'The body turns toward the affordance before interaction; sitting starts from a chair-facing posture.',
    validator: 'chair-facing-yaw and reach-facing-yaw',
  },
  {
    id: 'planted-foot-supports-travel',
    source: 'Humanoid walking references',
    behavior: 'walk',
    principle: 'Visible travel should match step cadence; a planted foot should not skate across the floor.',
    validator: 'walk-step-distance',
  },
];
