# talantly

Verified internship platform for Uzbekistan. Phase 1 MVP: a Telegram bot in
Uzbek (Latin) that onboards students and companies, backed by Supabase.

## Structure

```
apps/
  bot/       grammY + TypeScript Telegram bot (long polling)
  webapp/    Next.js 14 Telegram Mini App (talent-facing UI)
  admin/     Next.js 14 admin panel
packages/
  shared/    Types + constants + typed Supabase repos shared between apps
```

## Setup

```bash
npm install
cp .env.example .env   # then fill in the real values
```

## Scripts

```bash
npm run dev:bot     # start the bot in watch mode
npm run dev:webapp  # start the Mini App at http://localhost:3001
npm run dev:admin   # start admin panel at http://localhost:3000
npm run typecheck   # TypeScript across all workspaces
npm run lint        # ESLint across all workspaces
npm run test        # unit tests (initData validation, etc.)
```

## Dev note: testing Mini App status cards

The `/profile` screen renders one action card per talent status, purely from
the DB. To preview each card during development, flip the status directly in
the Supabase SQL editor (cloud project `fhfrhqhzecdfkahvthgp`):

```sql
-- find your talent row
select id, full_name, status from talents order by created_at desc;

-- flip status (pick one)
update talents set status = 'malumot_toldirilgan' where id = '<talent-id>';
update talents set status = 'tolov_kutilmoqda'    where id = '<talent-id>';
update talents set status = 'tolov_tasdiqlangan'  where id = '<talent-id>';
update talents set status = 'cv_tayyor'           where id = '<talent-id>';
update talents set status = 'test_otgan'          where id = '<talent-id>';
update talents set status = 'suhbat_belgilangan'  where id = '<talent-id>';
update talents set status = 'tekshirilgan'        where id = '<talent-id>';
update talents set status = 'rad_etilgan'         where id = '<talent-id>';
```

Notes:

- `test_otgan` card shows the score from the latest `skill_tests` row — insert
  one if none exists: `insert into skill_tests (talent_id, direction, score,
  answers) values ('<talent-id>', 'dasturlash', 80, '{}');`
- `suhbat_belgilangan` needs an `interviews` row with `scheduled_at`.
- `rad_etilgan` retry date comes from `interviews.decided_at` (+30 days).
- Real status changes in the app always write a `status_log` row; manual SQL
  flips are for UI preview only.

See `CLAUDE.md` for the quality guardrails that govern every code change.
