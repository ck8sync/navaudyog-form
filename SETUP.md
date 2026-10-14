# Nava Udyog: Setup & Verification

A QR lead-capture app (Vite + React + Tailwind) that saves leads to **Supabase**.

| What you want to change | Where |
| --- | --- |
| Text, flows, steps, options, form fields, **colours** | `src/content.ts` |
| Light / dark / system theme (default **light**) | `THEME.mode` in `src/content.ts` |
| Supabase keys, **logo URL** | `.env` |
| Logo file | `public/assets/` (e.g. `public/assets/logo.png` → `VITE_LOGO_URL=/assets/logo.png`) |

---

## 1. Create the Supabase table

Open **Supabase → SQL Editor** and run:

```sql
create table if not exists public.leads (
  id          bigint generated always as identity primary key,
  ref         text unique not null check (ref ~ '^NU-[A-Z]{3}-[A-F0-9]{8}$'),
  flow_id     text not null check (flow_id in ('JOB_SEEKER','EMPLOYER','HR_SERVICE')),
  event_id    text not null check (event_id ~ '^[A-Za-z0-9_-]{1,64}$'),
  source      text not null check (source   ~ '^[A-Za-z0-9_-]{1,64}$'),
  name        text not null check (char_length(name) between 2 and 80),
  mobile      text not null check (mobile ~ '^[6-9][0-9]{9}$'),
  email       text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$'),
  answers     jsonb not null default '{}' check (pg_column_size(answers) < 8192),
  created_at  timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_event_idx      on public.leads (event_id);

-- Security: the browser may INSERT only. It cannot read, update or delete.
alter table public.leads enable row level security;

drop policy if exists "anon can insert leads" on public.leads;
create policy "anon can insert leads"
  on public.leads for insert
  to anon
  with check (true);

revoke all on public.leads from anon;
grant insert (ref, flow_id, event_id, source, name, mobile, email, answers) on public.leads to anon;
```

> The CHECK constraints enforce validation on the server, so anything that bypasses the UI is still rejected.
> To read leads, use the Supabase dashboard (Table Editor) or the `service_role` key on a server. **Never put the service_role key in this app.**

### Optional: server-side rate limit (recommended for public QR codes)

```sql
create or replace function public.leads_rate_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (
    select 1 from public.leads
    where mobile = new.mobile and created_at > now() - interval '2 minutes'
  ) then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists leads_rate_limit on public.leads;
create trigger leads_rate_limit before insert on public.leads
  for each row execute function public.leads_rate_limit();
```

---

## 2. Configure & run

```bash
cp .env.example .env        # Windows: copy .env.example .env
# put in your Project URL and anon public key (Supabase → Project Settings → API)
npm install
npm run dev
```

Tracking parameters for the QR URL (letters, digits, `_` and `-` only; max 64 characters):

```
https://your-domain.com/?event=tech_expo_2026&src=booth_a
```

---

## 3. Verification checklist

Run through these after any change.

**Build**
- [ ] `npm run build` finishes with no TypeScript errors.
- [ ] `npm run preview` opens and the landing screen shows.

**Flows** (repeat for Job / Employees / HR)
- [ ] The wheel scrolls, snaps and responds to the ↑ ↓ keys.
- [ ] Choosing **Other** shows a text field.
- [ ] Chips: **Continue** stays disabled until at least one chip is selected.
- [ ] Form: invalid name, mobile or email shows an error on blur, and **Continue** stays disabled.
- [ ] Review: **Edit** returns to the correct step.
- [ ] Refreshing mid-flow keeps your answers (sessionStorage).

**Database**
- [ ] Submit, and the success screen shows a reference like `NU-EMP-3F9A12BC`.
- [ ] A row with the same `ref` appears in **Supabase → Table Editor → leads**.
- [ ] `event_id` / `source` match the URL params.
- [ ] Turn off Wi-Fi and submit: the error banner and **Retry** appear.
- [ ] Submitting twice within 15 s shows the rate-limit message.

**Security** (run in the browser console on the deployed site)
```js
// Should FAIL (RLS blocks reads)
await (await fetch(`${SUPABASE_URL}/rest/v1/leads?select=*`, {
  headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
})).json();   // → [] or permission error
```
- [ ] Reading leads with the anon key returns nothing.
- [ ] Inserting a lead with mobile `12345` is rejected (CHECK constraint).

---

## 4. Deploy

Static hosting (Vercel / Netlify / Cloudflare Pages):

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_LOGO_URL` (optional; the brand initial is shown if empty)

> `VITE_*` values are built into the bundle, so rebuild after changing `.env`.
