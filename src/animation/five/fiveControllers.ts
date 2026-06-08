import { useEffect, useMemo, useState } from 'react';
import { fiveTimeline } from './fiveStates';
import type { FiveControllerState } from './fiveRigTypes';

export function useFiveController(): FiveControllerState {
  const [momentIndex, setMomentIndex] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const moment = fiveTimeline[momentIndex];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMomentIndex((index) => (index + 1) % fiveTimeline.length);
    }, moment.durationMs);

    return () => window.clearTimeout(timer);
  }, [moment.durationMs, momentIndex]);

  useEffect(() => {
    if (moment.state === 'Sleep') {
      setIsBlinking(true);
      return undefined;
    }

    setIsBlinking(false);
    const blinkInterval = window.setInterval(() => {
      setIsBlinking(true);
      window.setTimeout(() => setIsBlinking(false), 130);
    }, 7600);

    return () => window.clearInterval(blinkInterval);
  }, [moment.state]);

  return useMemo(() => ({ moment, isBlinking }), [isBlinking, moment]);
}
