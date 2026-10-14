import { UI } from '../content';
import type { Answers, ChipGroup } from '../types';

interface Props {
  groups: ChipGroup[];
  values: Answers;
  onChange: (id: string, v: string | string[]) => void;
}

export function Chips({ groups, values, onChange }: Props) {
  const toggle = (g: ChipGroup, opt: string) => {
    navigator.vibrate?.(4);
    if (!g.multi) return onChange(g.id, opt);
    const cur = Array.isArray(values[g.id]) ? (values[g.id] as string[]) : [];
    onChange(g.id, cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]);
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-7 text-left">
      {groups.map((g) => {
        const v = values[g.id];
        return (
          <fieldset key={g.id} className="space-y-3">
            <legend className="flex w-full items-baseline justify-between text-xs font-semibold uppercase tracking-wider text-(--muted)">
              {g.title}
              {g.multi && <span className="normal-case tracking-normal">{UI.selectHint}</span>}
            </legend>
            <div className="flex flex-wrap gap-2">
              {g.options.map((o) => {
                const on = Array.isArray(v) ? v.includes(o) : v === o;
                return (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(g, o)}
                    className={`chip ${on ? 'chip-on' : ''}`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
