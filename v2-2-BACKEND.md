# 2️⃣ TALANTLY v2 — BACKEND + DB (noldan)

> Ikkinchi fayl. Frontend (1-fayl) tugagach boshla.
> **Supabase noldan quriladi.** Founder qarori — eski schema butunlay o'chadi, toza v2 quriladi.

---

## 0. STEP 0 — BACKUP, keyin o'chirish

Founder eskisini to'liq o'chirishni so'radi. Bajaramiz — lekin avval **bir marta** zaxira ol (5 daqiqa, qaytarib bo'lmaydigan qadamdan oldin standart amaliyot):

```bash
# Supabase ref: fhfrhqhzecdfkahvthgp
supabase db dump -f backup-v1-$(date +%F).sql --db-url "$SUPABASE_DB_URL"
```

Zaxira faylini `backups/` ga qo'y va **commit qilma** (`.gitignore`ga qo'sh). Faylni ko'rsat, hajmini ayt.

Zaxira tayyor bo'lgach — **to'xta, founder tasdiqini ol.** Keyin:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, service_role;
```

Bucketlar: `payment-screenshots`, `cv-pdfs` — qayta yaratilsin.

---

## 1. INFRA
- Supabase ref: **`fhfrhqhzecdfkahvthgp`**
- GitHub: `Mukhammadjan/talantly-platform`, git email `89453056+Mukhammadjan@users.noreply.github.com`
- `apps/webapp` (1-faylda qurildi) · `apps/bot` (grammY) · `apps/admin`
- AI: `claude-sonnet-4-6`

---

## 2. SCHEMA v2 — toza, eski xatolarsiz

> v1'ning 3 ta muammosi shu yerda tuzatiladi: **maosh maydoni bor**, **`vacancies` jadvali bor**, **dublikat `direction_needed` yo'q**.

Har jadval alohida migration. Hammasida RLS + `created_at timestamptz default now()`.

```sql
-- ENUMS
CREATE TYPE user_role     AS ENUM ('talent','moderator','admin');
CREATE TYPE user_mode     AS ENUM ('talant','izlovchi');
CREATE TYPE direction     AS ENUM ('dasturlash','dizayn','marketing','sotuv','data','boshqa');
CREATE TYPE talent_level  AS ENUM ('intern','mutaxassis');
CREATE TYPE needed_level  AS ENUM ('intern','mutaxassis','ikkalasi');
CREATE TYPE talent_status AS ENUM ('yangi','malumot_toldirilgan','tolov_kutilmoqda','tolov_tasdiqlangan','cv_tayyor','test_otgan','suhbat_belgilangan','tekshirilgan','rad_etilgan');
CREATE TYPE company_kind  AS ENUM ('kompaniya','tashkilot','startup','shaxsiy');
CREATE TYPE urgency       AS ENUM ('hoziroq','oy_ichida','korib_turibman');
CREATE TYPE request_kind  AS ENUM ('kompaniya_sorovi','talant_qiziqishi');
CREATE TYPE request_status AS ENUM ('yangi','korildi','boglanildi','yopildi');
CREATE TYPE unlock_kind   AS ENUM ('bir_martalik','obuna');
CREATE TYPE pay_status    AS ENUM ('kutilmoqda','tasdiqlangan','rad');
CREATE TYPE fee_status    AS ENUM ('pending','paid');
CREATE TYPE vacancy_status AS ENUM ('faol','yopilgan','qoralama');
```

**Jadvallar:**

| Jadval | Asosiy ustunlar |
|---|---|
| `users` | tg_id bigint unique, username, role `user_role` def 'talent', preferred_mode `user_mode`, is_blocked bool def false |
| `talents` | user_id→users, full_name, birth_year int, city, **district**, direction, level, experience_years, skill_tags text[], work_formats text[], **salary_from int**, **salary_currency text def 'UZS'**, headline, free_text, photo_url, portfolio_url, personality jsonb, **archetype text**, status `talent_status` def 'yangi', is_demo bool def false |
| `companies` | user_id→users, name, kind `company_kind`, **activity_type text**, city, district, description, logo_url, contact_name, phone_tg, **directions_needed text[]** (dublikat YO'Q), needed_level, urgency, **is_verified bool def false**, is_demo |
| **`vacancies`** ⭐ | company_id→companies, title, direction, level `needed_level`, **salary_from int**, **salary_to int**, salary_currency, description, city, district, work_formats text[], status `vacancy_status` def 'faol', is_demo |
| `personality_questions` | question, options jsonb, ord int, is_active bool |
| `test_questions` | direction, question, options jsonb, correct_index int, ord, is_active |
| `skill_tests` | talent_id, direction, score int (0–100), answers jsonb, passed_at |
| `cv_profiles` | talent_id, summary, skills jsonb, experience jsonb, ai_verdict, pdf_path |
| `interview_slots` | starts_at timestamptz, is_taken bool def false |
| `interviews` | talent_id, slot_id, scheduled_at, rating int (1–5), decision, notes |
| `requests` | kind `request_kind`, company_id, talent_id, **vacancy_id→vacancies** (nullable), note, status `request_status` def 'yangi' |
| `contact_unlocks` | **company_id**, talent_id, kind `unlock_kind`, amount int, screenshot_path, expires_at, status `pay_status` def 'kutilmoqda' |
| `payments` | talent_id (company_id YO'Q), amount int def 35000, screenshot_path, status `pay_status` |
| `placements` | company_id, talent_id, placed_at, trial_ends_at, fee_amount int, fee_status |
| **`saved_items`** ⭐ | user_id, kind text ('vacancy'/'talant'/'company'), target_id uuid, UNIQUE(user_id,kind,target_id) |
| **`profile_views`** ⭐ | talent_id, viewer_company_id, viewed_at |
| `status_log` | entity text, entity_id uuid, old_status, new_status, changed_by |
| `settings` | key text PK, value text |

**Seed `settings`:**
```sql
INSERT INTO settings (key,value) VALUES
 ('show_demo_data','true'),
 ('cv_payment_required','true'),
 ('cv_price','35000'),
 ('contact_unlock_price','99000'),
 ('subscription_price','2500000'),
 ('success_fee_intern','800000'),
 ('success_fee_mutaxassis','2000000'),
 ('success_fee_tech','1500000'),
 ('payment_card_number','0000 0000 0000 0000'),   -- ⚠️ REAL KARTA KERAK
 ('payment_card_owner','MUXAMMADJON KABULJANOV');
```

⚠️ **Karta raqami soxta** — founderdan real raqamni so'ra. Busiz hech kim to'lay olmaydi.

---

## 3. DEMO SEED (ilova bo'sh ko'rinmasin)
- ~20 demo talant (`is_demo=true`) — turli yo'nalish/daraja/tuman/**maosh**, 6 arxetip, ball 60–95, bir qismi `tekshirilgan`
- ~6 demo kompaniya + ~8 demo vakansiya
- 15 shaxsiyat savoli, har yo'nalish uchun ~10 ko'nikma savoli (60)
- ~28 suhbat sloti (kelasi 2 hafta)
- **Real yozuv seed qilinmaydi** — `is_demo=false` faqat haqiqiy odam

---

## 4. DEMO TOGGLE 🔑
```
show_demo_data='true'  → demo + real
show_demo_data='false' → faqat is_demo=false
```
- **Har o'qishda `settings`dan** — hardcode YO'Q
- Ta'sir: feed, xarita zona sanog'i, qidiruv, Doskam, statistika, vakansiyalar
- Demo **o'chirilmaydi** — yashiriladi
- Demo kartada `micro` yorliq **"DEMO"** (`--t-ink-3`)
- Demo profilga so'rov/chat **bloklanadi** → toast "Bu demo profil"

---

## 5. AUTH + RLS
- **initData server tomonda HMAC** → JWT. `initDataUnsafe`ga **ishonma**
- ⚠️ **20-iyul 2026** origin himoyasi — BotFather domeni = deployed domen. Tekshir, ayt
- Talant o'z `talents` qatorini yozadi, boshqaникini **yo'q**
- Izlovchi o'z `companies` + `vacancies` yozadi
- `talents` o'qish: hamma (feed). CV/telefon — **faqat unlock bo'lsa**
- `settings` yozish: **faqat `role='admin'`**
- `moderator`: user qo'shadi/tahrirlaydi/tekshiradi/to'lov tasdiqlaydi — **`settings` YO'Q**
- Qo'lda qo'shilgan user: `is_demo=false`, `status='yangi'`

---

## 6. API — `api.ts` mock → real

| Funksiya | Jadval |
|---|---|
| `getTalents(filters)` | `talents` + demo filtri + `skill_tests.score` + `interviews.rating` (+ maosh filtri) |
| `getTalent(id)` | `talents` + `cv_profiles` (CV/telefon faqat unlock) + `profile_views` yoz |
| `saveTalentProfile` | `talents` (o'ziniki) + `status_log` |
| `getPersonalityQuestions` | `personality_questions` (faol, ord) |
| `savePersonality` | `talents.personality` + `archetype` + status |
| `getSkillQuestions(dir)` | `test_questions` |
| `saveSkillTest` | `skill_tests` + status |
| `generateCV` | `claude-sonnet-4-6` → `cv_profiles` |
| `getSlots`/`bookSlot` | `interview_slots` → `interviews` |
| `getMyRequests` | `requests` (talant_id=me) |
| `sendRequest` | `requests` (`kompaniya_sorovi`) |
| `createVacancy`/`getVacancies` | **`vacancies`** |
| `applyToVacancy` | `requests` (`talant_qiziqishi`, vacancy_id) |
| `getZones` | `talents` district GROUP BY + count |
| `createUnlock` | **`contact_unlocks`** (payments EMAS) |
| `toggleSave` | `saved_items` |
| `getSettings` | `settings` (TEXT — parse qil) |

**Har status o'zgarishida `status_log`.**

---

## 7. BOT — PRO

**Asosiy:** `/start` → rol · `/start <payload>` deep link · Menu tugma → Mini App · `/help`,`/profil`,`/holat` · `setMyCommands` (rol bo'yicha)

**Push (retention — v1'da odamlar shu sababdan qotib qolgandi):**
- Talantga: ro'yxatdan o'tdi + 1 soat jim → eslatma · profil to'ldi → "Endi shaxsiyat testi" · test → "Endi ko'nikma testi" · CV → "Suhbat tanlang" · suhbat belgilandi → **1 soat oldin eslatma** · **tekshirildi** → tabrik + muhr · rad → sabab · so'rov keldi
- Izlovchiga: ariza keldi · to'lov tasdiqlandi → "Chat ochildi" · yangi mos nomzod
- Admin/moderatorga: to'lov skrinshoti · tekshiruv navbati · yangi so'rov

Trigger: `status_log` yozilganda. Har xabarda **Mini App deep link tugmasi**.

**Pro sifat:** har handler `try/catch` (o'zbekcha xabar, texnik xato logga) · **rate limit** · bloklangan user (403) → DB'ga belgila · **idempotent** (`status_log` id) · **graceful shutdown** (SIGTERM) · **webhook** (polling emas) · **session DB'da** (xotirada emas)

**Railway 24/7 🔥** — `Dockerfile`/`railway.json` (repoda config bor: commit `eaa6705`), ENV: `BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `WEBAPP_URL`, health check, webhook. **Isbot:** deploy log + `/start` javobi

---

## 8. DEPLOY — v1 xatosi takrorlanmasin
Menu button URL'ni **qo'lda o'zgartirish taqiqlanadi** — aynan shu v1'ni o'ldirdi (`?v=ee86514` qotib qolgan edi).
Deploy hook'da `setChatMenuButton` avtomatik chaqirilsin, `?v=${process.env.VERCEL_GIT_COMMIT_SHA}` bilan. Qotirilgan hash **hech qachon**.

---

## 9. ACCEPTANCE (isbot, "PASS" YO'Q)
1. **Backup fayli bor** — yo'l + hajm ko'rsat
2. `npm run typecheck` + lint — natija
3. Schema quruldi — `list_tables` chiqishini joyla (18 jadval)
4. Seed ishladi — har jadval sanog'i SQL bilan
5. `show_demo_data='false'` → feed'da 0 qoladi (real user hali yo'q) — SQL oldin/keyin
6. Talant o'z profilini yozadi, boshqaникини **yo'q** (RLS) — ko'rsat
7. **Shaxsiyat testi loop qilmaydi** — `personality` jsonb SQL bilan
8. Ko'nikma testi `skill_tests` yozadi — SQL
9. Slot band + `interviews` — SQL
10. Har status → `status_log` — SQL
11. Narx `settings`dan — hardcode grep bo'sh
12. **Bot Railway'da 24/7** — deploy log + `/start`
13. Push yubordi — bot logi
14. Menu URL avtomatik yangilanadi — kod yo'li
15. Telefonda `yangi` → `tekshirilgan` qotmasdan o'tdi

---

## 10. TARTIB
1. STEP 0 — **backup**, ko'rsat, **to'xta, tasdiq ol**
2. `DROP SCHEMA` → v2 schema (migration'lar)
3. Seed (demo + savollar + slotlar + settings)
4. Auth + RLS
5. `api.ts` mock → real (talant oqimi)
6. Izlovchi + vakansiya + `contact_unlocks`
7. Demo toggle
8. Bot: komandalar → push → webhook → **Railway**
9. Deploy hook (menu URL avtomatik)

**Ikkilanish → so'ra.**

---

> Kod tugagach eng muhimi: **bot 24/7 + REAL KARTA RAQAMI + 1 ta real to'lovchi kompaniya.**
