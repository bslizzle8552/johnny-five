export const TAU = Math.PI * 2;

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function wave(timeMs: number, periodMs: number, phase = 0) {
  return Math.sin((timeMs / periodMs) * TAU + phase);
}

export function pulse(timeMs: number, periodMs: number, phase = 0) {
  return (wave(timeMs, periodMs, phase) + 1) / 2;
}

export function smoothstep(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

export function makeTransform() {
  return {
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
  };
}
