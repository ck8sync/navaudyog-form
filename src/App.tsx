import { useState } from 'react';
import { Chips } from './components/Chips';
import { Form } from './components/Form';
import { Review } from './components/Review';
import { Wheel } from './components/Wheel';
import { BRAND, FLOWS, LANDING, LANDING_DEFAULT, UI } from './content';
import { submitLead } from './lib/api';
import { TRACKING, useLead } from './lib/store';
import { cleanMobile, validate } from './lib/validation';
import type { Answers, Flow, FlowId, Step } from './types';

/** Logo from .env (VITE_LOGO_URL). Falls back to the brand initial when unset. */
const LOGO_URL = import.meta.env.VITE_LOGO_URL?.trim() || '';

export default function App() {
  const lead = useLead();
  const [pick, setPick] = useState<string>(LANDING_DEFAULT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Landing */
  if (!lead.flowId) {
    return (
      <Shell onHome={lead.reset}>
        <main className="flex flex-1 flex-col justify-center gap-8 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{UI.landingTitle}</h1>
            <p className="text-(--muted)">{BRAND.tagline}</p>
          </div>
          <Wheel options={LANDING} value={pick} onChange={setPick} />
        </main>
        <Footer>
          <button className="btn-primary w-full" onClick={() => lead.start(pick as FlowId)}>
            {UI.continue}
          </button>
        </Footer>
      </Shell>
    );
  }

  const flow = FLOWS[lead.flowId];

  /* Success */
  if (lead.done) {
    return (
      <Shell onHome={lead.reset}>
        <main className="fade flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="grid size-16 place-items-center rounded-full bg-(--accent) text-(--accent-text)">
            <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth={3}>
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{flow.success.heading}</h1>
          <p className="max-w-xs text-(--muted)">{flow.success.message}</p>
          {lead.ref && (
            <p className="rounded-full border border-(--border) px-3 py-1 font-mono text-xs">
              {UI.ref}: <span className="text-(--accent)">{lead.ref}</span>
            </p>
          )}
        </main>
        <Footer>
          <button className="btn-ghost w-full" onClick={lead.reset}>
            {UI.home}
          </button>
        </Footer>
      </Shell>
    );
  }

  /* Flow */
  const step = flow.steps[Math.min(lead.step, flow.steps.length - 1)];
  const isLast = step.type === 'review';
  const canGo = !busy && isStepValid(step, lead.answers, lead.consent);

  const goTo = (i: number) => {
    setError(null);
    lead.patch({ step: i });
    window.scrollTo({ top: 0 });
  };

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const ref = await submitLead(buildLead(lead.flowId!, flow, lead.answers, lead.other));
      lead.patch({ done: true, ref });
    } catch (e) {
      setError(e instanceof Error ? e.message : UI.errorGeneric);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell onHome={lead.reset}>
      <Progress steps={flow.steps} current={lead.step} />

      <main key={step.id} className="fade flex flex-1 flex-col justify-center gap-7 py-6 text-center">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{step.title}</h1>
          {step.subtitle && <p className="text-sm text-(--muted)">{step.subtitle}</p>}
        </div>

        {step.type === 'wheel' && (
          <>
            <Wheel
              options={step.options}
              value={String(lead.answers[step.id] ?? step.defaultValue ?? '')}
              onChange={(v) => lead.setAnswer(step.id, v)}
            />
            {step.options.find((o) => o.value === lead.answers[step.id])?.other && (
              <input
                className="input mx-auto max-w-sm"
                aria-label={UI.otherLabel}
                placeholder={step.otherPlaceholder ?? UI.otherLabel}
                maxLength={80}
                value={lead.other[step.id] ?? ''}
                onChange={(e) => lead.setOther(step.id, e.target.value)}
              />
            )}
          </>
        )}

        {step.type === 'chips' && <Chips groups={step.groups} values={lead.answers} onChange={lead.setAnswer} />}

        {step.type === 'form' && (
          <>
            <Form fields={step.fields} values={lead.answers} onChange={lead.setAnswer} />
            <Consent text={UI.formConsent} checked={lead.consent} onChange={(c) => lead.patch({ consent: c })} />
          </>
        )}

        {step.type === 'review' && (
          <>
            {error && (
              <div role="alert" className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-xl border border-(--danger) px-4 py-3 text-left text-sm text-(--danger)">
                {error}
                <button className="btn-link text-(--danger)" onClick={submit}>{UI.retry}</button>
              </div>
            )}
            <Review flow={flow} answers={lead.answers} other={lead.other} onEdit={goTo} />
            <Consent text={UI.reviewConsent} checked={lead.consent} onChange={(c) => lead.patch({ consent: c })} />
          </>
        )}
      </main>

      <Footer>
        <div className="flex items-center justify-between gap-4">
          <button className="btn-ghost" onClick={() => (lead.step > 0 ? goTo(lead.step - 1) : lead.reset())}>
            {UI.back}
          </button>
          <button className="btn-primary min-w-36" disabled={!canGo} onClick={isLast ? submit : () => goTo(lead.step + 1)}>
            {busy ? UI.submitting : isLast ? UI.submit : UI.continue}
          </button>
        </div>
      </Footer>
    </Shell>
  );
}

/* Helpers */

function isStepValid(step: Step, answers: Answers, consent: boolean) {
  switch (step.type) {
    case 'chips':
      return step.groups.some((g) => {
        const v = answers[g.id];
        return Array.isArray(v) ? v.length > 0 : !!v;
      });
    case 'form':
      return consent && step.fields.every((f) => !validate(f, answers[f.id]));
    case 'review':
      return consent;
    default:
      return true;
  }
}

/** Collects the core contact fields and drops anything not defined in the flow config. */
function buildLead(flowId: FlowId, flow: Flow, answers: Answers, other: Record<string, string>) {
  const clean: Answers = {};
  for (const s of flow.steps) {
    if (s.type === 'wheel') {
      const v = String(answers[s.id] ?? '');
      const opt = s.options.find((o) => o.value === v);
      if (opt) clean[s.id] = opt.other && other[s.id]?.trim() ? `Other: ${other[s.id].trim().slice(0, 80)}` : opt.value;
    } else if (s.type === 'chips') {
      for (const g of s.groups) {
        const v = answers[g.id];
        const list = (Array.isArray(v) ? v : v ? [v] : []).filter((x) => g.options.includes(x));
        if (list.length) clean[g.id] = g.multi ? list : list[0];
      }
    } else if (s.type === 'form') {
      for (const f of s.fields) {
        const v = String(answers[f.id] ?? '').trim().slice(0, 120);
        if (v && (f.type !== 'select' || f.options?.includes(v))) clean[f.id] = f.type === 'tel' ? cleanMobile(v) : v;
      }
    }
  }
  const str = (k: string) => String(clean[k] ?? '');
  return {
    flowId,
    code: flow.code,
    ...TRACKING,
    name: str('fullName') || str('contactPerson'),
    mobile: str('mobile'),
    email: str('email'),
    answers: clean,
  };
}

/* Layout */

function Shell({ children, onHome }: { children: React.ReactNode; onHome: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5">
      <header className="flex items-center justify-between py-5">
        <button onClick={onHome} className="flex items-center gap-2 font-semibold tracking-tight">
          {LOGO_URL ? (
            <img src={LOGO_URL} alt="" className="h-8 w-auto object-contain" />
          ) : (
            <span className="grid size-7 place-items-center rounded-lg bg-(--accent) text-sm font-bold text-(--accent-text)">
              {BRAND.name[0]}
            </span>
          )}
          {BRAND.name}
        </button>
      </header>
      {children}
    </div>
  );
}

function Footer({ children }: { children: React.ReactNode }) {
  return <footer className="safe-bottom sticky bottom-0 bg-(--bg)/90 pt-3 backdrop-blur">{children}</footer>;
}

function Progress({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <div className="space-y-2" aria-label={`Step ${current + 1} of ${steps.length}`}>
      <div className="flex gap-1.5">
        {steps.map((s, i) => (
          <div key={s.id} className={`h-1 flex-1 rounded-full transition-colors ${i <= current ? 'bg-(--accent)' : 'bg-(--border)'}`} />
        ))}
      </div>
      <p className="text-xs text-(--muted)">
        {current + 1} / {steps.length} · {steps[current]?.label}
      </p>
    </div>
  );
}

function Consent({ text, checked, onChange }: { text: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <label className="mx-auto flex max-w-xl cursor-pointer items-start gap-3 text-left text-xs text-(--muted)">
      <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-(--accent)" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {text}
    </label>
  );
}
