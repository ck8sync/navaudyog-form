import { useState } from 'react';
import { formatMobile, validate } from '../lib/validation';
import type { Answers, Field } from '../types';

interface Props {
  fields: Field[];
  values: Answers;
  onChange: (id: string, v: string) => void;
}

export function Form({ fields, values, onChange }: Props) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const blur = (id: string) => setTouched((t) => ({ ...t, [id]: true }));

  return (
    <div className="mx-auto grid w-full max-w-xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
      {fields.map((f) => {
        const v = String(values[f.id] ?? '');
        const err = touched[f.id] ? validate(f, v) : null;
        const common = {
          id: f.id,
          name: f.id,
          onBlur: () => blur(f.id),
          'aria-invalid': !!err,
          'aria-describedby': err ? `${f.id}-err` : undefined,
          className: `input ${err ? 'input-err' : ''}`,
        };
        return (
          <div key={f.id} className={`space-y-1.5 ${f.wide ? 'sm:col-span-2' : ''}`}>
            <label htmlFor={f.id} className="block text-xs font-medium text-(--muted)">
              {f.label}
              {f.required && <span className="text-(--accent)"> *</span>}
            </label>
            {f.type === 'select' ? (
              <select {...common} value={v} onChange={(e) => onChange(f.id, e.target.value)}>
                <option value="">{f.placeholder}</option>
                {f.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <div className="relative">
                {f.type === 'tel' && (
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-(--muted)">+91</span>
                )}
                <input
                  {...common}
                  type={f.type}
                  inputMode={f.type === 'tel' ? 'numeric' : undefined}
                  autoComplete={f.type === 'tel' ? 'tel-national' : f.type === 'email' ? 'email' : f.rule === 'name' ? 'name' : 'off'}
                  maxLength={f.type === 'tel' ? 11 : 120}
                  placeholder={f.placeholder}
                  value={f.type === 'tel' ? formatMobile(v) : v}
                  onChange={(e) => onChange(f.id, f.type === 'tel' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value)}
                  style={f.type === 'tel' ? { paddingLeft: '3.25rem' } : undefined}
                />
              </div>
            )}
            {err && (
              <p id={`${f.id}-err`} className="text-xs text-(--danger)">
                {err}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
