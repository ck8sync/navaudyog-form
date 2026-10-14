import { UI } from '../content';
import type { Answers, FlowId } from '../types';

const URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!URL || !KEY) throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');

export interface LeadInput {
  flowId: FlowId;
  code: string;
  eventId: string;
  source: string;
  name: string;
  mobile: string;
  email: string;
  answers: Answers;
}

const COOLDOWN_MS = 15_000;
const TIMEOUT_MS = 12_000;
let lastSubmit = 0;

/**
 * Inserts a lead through the Supabase REST API (PostgREST).
 * Uses only the public anon key; access is restricted by Row Level Security (see SETUP.md).
 * Returns the lead reference.
 */
export async function submitLead(lead: LeadInput): Promise<string> {
  const now = Date.now();
  if (now - lastSubmit < COOLDOWN_MS) throw new Error(UI.errorRateLimit);

  const ref = `NU-${lead.code}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  let res: Response;
  try {
    res = await fetch(`${URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        ref,
        flow_id: lead.flowId,
        event_id: lead.eventId,
        source: lead.source,
        name: lead.name,
        mobile: lead.mobile,
        email: lead.email.toLowerCase(),
        answers: lead.answers,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new Error(UI.errorGeneric);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (import.meta.env.DEV) console.error('Supabase insert failed', res.status, body);
    throw new Error(body.includes('rate_limited') ? UI.errorRateLimit : UI.errorGeneric);
  }

  lastSubmit = now;
  return ref;
}
