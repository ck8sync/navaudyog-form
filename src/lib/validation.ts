import type { Field } from '../types';

const NAME = /^[\p{L}\s.'-]{2,80}$/u;
const EMAIL = /^[^\s@]{1,64}@[^\s@]+\.[a-z]{2,}$/i;
const MOBILE = /^[6-9]\d{9}$/;

/** Strip to 10 digits (drops a leading 91 / 0). */
export const cleanMobile = (v = '') => v.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '').slice(0, 10);

export const formatMobile = (v = '') => {
  const d = cleanMobile(v);
  return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
};

/** Returns an error message, or null when valid. */
export function validate(field: Field, raw: unknown): string | null {
  const v = String(raw ?? '').trim();
  if (!v) return field.required ? 'Required' : null;
  switch (field.rule) {
    case 'name':
      return NAME.test(v) ? null : 'Enter a valid name';
    case 'email':
      return EMAIL.test(v) && v.length <= 254 ? null : 'Enter a valid email';
    case 'mobile':
      return MOBILE.test(cleanMobile(v)) ? null : 'Enter a valid 10-digit mobile';
    default:
      return v.length >= 2 && v.length <= 120 ? null : 'Enter 2–120 characters';
  }
}
