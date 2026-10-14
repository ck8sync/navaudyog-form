import { useCallback, useEffect, useState } from 'react';
import { BRAND, FLOWS } from '../content';
import type { Answers, FlowId, LeadState } from '../types';

const KEY = 'nu_session_v2';

const initial: LeadState = { flowId: null, step: 0, answers: {}, other: {}, consent: true, ref: null, done: false };

function load(): LeadState {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const s = { ...initial, ...JSON.parse(raw) } as LeadState;
      if (s.flowId && !FLOWS[s.flowId]) return initial;
      return s;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return initial;
}

/** Read once per page load; only [A-Za-z0-9_-] allowed, max 64 chars. */
const param = (name: string, fallback: string) => {
  const v = new URLSearchParams(location.search).get(name)?.trim() ?? '';
  return /^[\w-]{1,64}$/.test(v) ? v : fallback;
};
export const TRACKING = {
  eventId: param('event', BRAND.defaultEvent),
  source: param('src', BRAND.defaultSource),
};

export function useLead() {
  const [s, setS] = useState<LeadState>(load);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* storage full / private mode */
    }
  }, [s]);

  const patch = useCallback((p: Partial<LeadState>) => setS((prev) => ({ ...prev, ...p })), []);

  const start = useCallback((flowId: FlowId) => {
    const answers: Answers = {};
    for (const step of FLOWS[flowId].steps) {
      if (step.type === 'wheel' && step.defaultValue) answers[step.id] = step.defaultValue;
    }
    setS({ ...initial, flowId, answers });
  }, []);

  const setAnswer = useCallback(
    (k: string, v: string | string[]) => setS((p) => ({ ...p, answers: { ...p.answers, [k]: v } })),
    [],
  );
  const setOther = useCallback(
    (k: string, v: string) => setS((p) => ({ ...p, other: { ...p.other, [k]: v } })),
    [],
  );
  const reset = useCallback(() => setS(initial), []);

  return { ...s, patch, start, setAnswer, setOther, reset };
}
