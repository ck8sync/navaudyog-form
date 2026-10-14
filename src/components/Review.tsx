import { UI } from '../content';
import { formatMobile } from '../lib/validation';
import type { Answers, Flow } from '../types';

interface Props {
  flow: Flow;
  answers: Answers;
  other: Record<string, string>;
  onEdit: (step: number) => void;
}

export function Review({ flow, answers, other, onEdit }: Props) {
  const rows: { label: string; value: string; step: number }[] = [];

  flow.steps.forEach((s, i) => {
    if (s.type === 'wheel') {
      const v = String(answers[s.id] ?? '');
      const opt = s.options.find((o) => o.value === v);
      rows.push({ label: s.label, value: opt?.other && other[s.id] ? other[s.id] : opt?.label ?? v, step: i });
    } else if (s.type === 'chips') {
      s.groups.forEach((g) => {
        const v = answers[g.id];
        rows.push({ label: g.title, value: (Array.isArray(v) ? v.join(', ') : v) || '—', step: i });
      });
    } else if (s.type === 'form') {
      s.fields.forEach((f) => {
        const v = String(answers[f.id] ?? '');
        if (v) rows.push({ label: f.label, value: f.type === 'tel' ? `+91 ${formatMobile(v)}` : v, step: i });
      });
    }
  });

  return (
    <dl className="card mx-auto w-full max-w-xl divide-y divide-(--border) text-left">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-3 px-5 py-3">
          <div className="min-w-0">
            <dt className="text-[11px] font-medium uppercase tracking-wider text-(--muted)">{r.label}</dt>
            <dd className="truncate text-sm font-medium">{r.value}</dd>
          </div>
          <button type="button" onClick={() => onEdit(r.step)} className="btn-link shrink-0">
            {UI.edit}
          </button>
        </div>
      ))}
    </dl>
  );
}
