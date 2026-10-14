import { useEffect, useRef, useState } from 'react';
import type { Option } from '../types';

const H = 52; // row height
const PAD = 2; // rows above/below centre

interface Props {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}

export function Wheel({ options, value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(0);
  const selected = Math.max(0, options.findIndex((o) => o.value === value));
  // Row highlighted during scrolling; null means "follow value"
  const [scrolling, setScrolling] = useState<number | null>(null);
  const active = scrolling ?? selected;

  // Sync scroll position when value changes externally
  useEffect(() => {
    const el = ref.current;
    if (el && Math.round(el.scrollTop / H) !== selected) el.scrollTop = selected * H;
  }, [selected]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (i: number) => {
    const c = Math.max(0, Math.min(options.length - 1, i));
    ref.current?.scrollTo({ top: c * H, behavior: 'smooth' });
    if (options[c].value !== value) onChange(options[c].value);
  };

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const i = Math.max(0, Math.min(options.length - 1, Math.round(el.scrollTop / H)));
    if (i !== active) {
      setScrolling(i);
      navigator.vibrate?.(4);
    }
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (options[i].value !== value) onChange(options[i].value);
      setScrolling(null);
    }, 90);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowUp: active - 1, ArrowDown: active + 1, Home: 0, End: options.length - 1 };
    if (e.key in map) {
      e.preventDefault();
      go(map[e.key]);
    }
  };

  return (
    <div
      role="listbox"
      tabIndex={0}
      aria-activedescendant={`opt-${active}`}
      onKeyDown={onKey}
      className="wheel relative mx-auto w-full max-w-sm rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent)"
      style={{ height: H * (PAD * 2 + 1) }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-2 rounded-xl bg-(--accent-soft)"
        style={{ top: PAD * H, height: H }}
      />
      <div
        ref={ref}
        onScroll={onScroll}
        className="no-scrollbar relative h-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
        style={{ paddingBlock: PAD * H }}
      >
        {options.map((o, i) => {
          const d = Math.abs(i - active);
          return (
            <div
              key={o.value}
              id={`opt-${i}`}
              role="option"
              aria-selected={d === 0}
              onClick={() => go(i)}
              className="flex snap-center cursor-pointer select-none items-center justify-center px-4 text-center transition-[opacity,transform,color] duration-200"
              style={{
                height: H,
                opacity: d === 0 ? 1 : d === 1 ? 0.45 : 0.2,
                transform: `scale(${d === 0 ? 1 : 0.92})`,
                color: d === 0 ? 'var(--accent)' : 'var(--text)',
                fontWeight: d === 0 ? 700 : 500,
              }}
            >
              <span className="truncate text-lg">{o.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
