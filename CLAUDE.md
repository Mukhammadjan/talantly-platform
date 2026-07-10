# talantly — Claude Code operating instructions

## Product

talantly.uz is a **verified internship platform for Uzbekistan**. It connects
inexperienced young people (graduates, students) with companies that need
interns. The core problem: youth can't get jobs without experience and can't
get experience without jobs; companies can't find trustworthy junior talent
except through personal connections. talantly's answer: **VERIFICATION AS A
PRODUCT**.

Every talent passes a 4-stage verification engine before being shown to
companies:

1. **AI CV + profile** — AI builds a professional profile from their raw data,
   surfacing skills they can't articulate themselves.
2. **Skill test** — 10-question online assessment for their direction.
3. **Live interview** — a human moderator evaluates communication, character,
   motivation.
4. **Verified profile** — skill score + AI verdict + interview rating =
   certificate, shown with a green "Tekshirilgan" (Verified) badge.

### Business model (MVP)

- **B2C:** AI CV costs 35,000 UZS (one-time, paid by card transfer + receipt
  screenshot sent in the bot chat, manually confirmed by a moderator — **NO
  payment API in MVP**).
- **B2B:** success fee paid only after the intern passes the trial period:
  regular intern 800,000 UZS, tech/design 1,500,000 UZS.
- **Matching is MANUAL in MVP** (concierge): admin picks verified talents for a
  company request. No auto-matching.

### Roles

- **talent** — Telegram bot + Mini App
- **company** — web form, contacted by team
- **moderator** — admin panel + bot `/baholash`
- **admin / founder** — everything + matching + stats

### Team

Muxammadjon Kabuljanov (Founder, product/design), Kumush O'tkirova (CEO),
Zuhratosh Tursunboyeva (Co-Founder). Admin contact: `+998 99-030-73-22`.

## Architecture split (important)

- **BOT (grammY)** = the door + notifications: `/start`, deep links, opens the
  Mini App, receives the payment screenshot photo, sends reminders, delivers
  the CV PDF, moderator `/baholash` flow, admin approve/reject buttons.
- **MINI APP (Telegram Web App)** = ALL rich UI for the talent: multi-step
  registration form, profile view with status timeline, skill test, interview
  slot booking, CV preview. This is the product's face — **UI/UX quality is a
  hard requirement**.
- **ADMIN PANEL (Next.js web)** = moderator/admin operations.

## Design system (applies to Mini App AND admin panel)

The founder is a UX/UI designer; **sloppy UI is a FAIL**.

- **Tokens:** background cream `#FBF6F0`; surface white; primary orange
  `#F26430` (deep `#F0530A`, light `#FF8A3D`); verified green `#2FB86B` (deep
  `#1F9E58`); ink `#191512`; soft ink `#6B625B`; line `#EAE2D8`.
- **Radii:** cards 20px, buttons pill (999px), inputs 14px.
- **Typography:** system font stack is fine, but hierarchy must be strict (one
  H per screen, 13–15px body, 11px uppercase-tracked labels).
- **Shadows:** soft only — `0 18px 40px -22px rgba(120,70,30,.25)`.
- **Brand mark:** green check seal — a circle with a white check, used for
  "Tekshirilgan".
- Mini App must also read Telegram theme params for background harmony but
  keep brand accents.
- Every screen: generous whitespace, one primary action, obvious progress.
- Micro-interactions: button press states, skeleton loaders while fetching,
  smooth step transitions.
- All text Uzbek (Latin), warm "siz" tone.

## Live infrastructure (already exists — do not recreate)

Supabase cloud project ref: **`fhfrhqhzecdfkahvthgp`** (name:
`talantly-platform`). Schema **ALREADY APPLIED — source of truth**.
**DO NOT create/apply schema migrations. If a column seems missing, STOP and
ask.**

### 11 tables in the `public` schema

- `users(id, tg_id, auth_uid, phone, role[talent|moderator|admin], created_at)`
- `talents(id, user_id, full_name, birth_year[1985-2012], city,
  direction[dasturlash|dizayn|marketing|sotuv|data|boshqa], education,
  free_text, portfolio_url,
  status[yangi|malumot_toldirilgan|tolov_kutilmoqda|tolov_tasdiqlangan|
  cv_tayyor|test_otgan|suhbat_belgilangan|tekshirilgan|rad_etilgan],
  bot_state jsonb, verified_at, created_at)`
- `payments(id, talent_id, amount=35000, screenshot_path,
  status[kutilmoqda|tasdiqlangan|rad], confirmed_by, confirmed_at, created_at)`
- `cv_profiles(id, talent_id unique, summary, skills jsonb, experience jsonb,
  ai_verdict, pdf_path, generated_at)`
- `skill_tests(id, talent_id, direction, score[0-100], answers jsonb,
  passed_at)`
- `test_questions(id, direction, question, options jsonb, correct_index,
  is_active)` — seeded with 10 Uzbek questions for `dasturlash`
- `interview_slots(id, starts_at, is_taken, created_by)` — 3 future slots
  seeded
- `interviews(id, talent_id, moderator_id, scheduled_at, rating[1-5], notes,
  decision[approved|rejected], decided_at, created_at)`
- `companies(id, name, contact_name, phone_tg, direction_needed,
  status[yangi|boglanildi|nomzod_yuborildi|joylashuv|tolov_olindi], notes,
  created_at)`
- `placements(id, company_id, talent_id, placed_at, trial_ends_at, fee_amount,
  fee_status[pending|paid])`
- `status_log(id, entity, entity_id, old_status, new_status, changed_by,
  created_at)`

RLS enabled on all tables, NO policies (deny-all; server code uses the service
role key). Private buckets: `payment-screenshots`, `cv-pdfs`.

## QUALITY GUARDRAILS — govern every stage

1. NO placeholders, NO "TODO later", NO stubs faking success. If blocked, STOP
   and say why.
2. After every stage run `npm run typecheck` and `npm run lint`, paste REAL
   output, fix failures first.
3. All user-facing text Uzbek (Latin). Code, comments, commits English.
4. Talent flow state lives in Supabase (talents fields + bot_state jsonb) —
   survives restarts.
5. All DB access through a typed repository layer shared between apps. No
   scattered raw calls.
6. Never commit secrets: `.env` in `.gitignore`, `.env.example` committed.
7. Never claim a DB step done without querying the CLOUD DB and pasting the
   real result.
8. Every status change writes a `status_log` row.
9. Mini App API: every request must validate Telegram initData (HMAC-SHA256
   with bot token, check auth_date freshness) on the SERVER before any DB
   access. The service role key exists ONLY on the server. Never trust tg_id
   sent from the client.
10. End every stage with a SELF-CHECK REPORT: each acceptance item PASS/FAIL +
    concrete evidence. Never PASS without evidence.
11. Work stages IN ORDER; stop at every CHECKPOINT and wait for the founder.

## Tech stack

TypeScript everywhere, npm workspaces monorepo:

- **apps/bot** — grammY, long polling.
- **apps/webapp** — Next.js 14 (app router) — the Telegram Mini App. Client
  uses `@telegram-apps/sdk` (or `window.Telegram.WebApp` directly); API routes
  validate initData and use the service role server-side. Tailwind, brand
  tokens as CSS vars.
- **apps/admin** — Next.js 14 + `@supabase/ssr` + Supabase Auth
  (email/password), Tailwind.
- **packages/shared** — types, constants, repos, cv module.
- **AI** — Anthropic API, model `claude-sonnet-4-6`.
- **PDF** — HTML template → Playwright `page.pdf()`.

## Environment variables

All in `.env` at the repo root; `.env.example` committed:

- `TELEGRAM_BOT_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `ADMIN_TG_ID` (numeric)
- `ADMIN_USERNAME` (Telegram username used by `/yordam`)
- `PAYMENT_CARD_NUMBER`
- `PAYMENT_CARD_OWNER`
- `WEBAPP_URL` (https URL of the deployed Mini App; empty until Stage 5)

## Root scripts

- `npm run dev:bot` — Telegram bot in watch mode
- `npm run dev:webapp` — Mini App dev server (exists from Stage 5)
- `npm run dev:admin` — admin panel dev server
- `npm run typecheck` — TypeScript check across all workspaces
- `npm run lint` — ESLint across the repo

## Language conventions

- All bot / Mini App / admin copy in **Uzbek (Latin)**: "Assalomu alaykum!",
  "Xush kelibsiz", "Ismingizni kiriting", etc. Never Cyrillic, never Russian,
  never English in user-facing strings. Warm "siz" tone.
- All code identifiers, comments, log messages, and commit messages in
  English.
