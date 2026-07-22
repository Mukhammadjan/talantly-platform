# 1️⃣ TALANTLY v2 — FRONTEND (noldan)

> Birinchi fayl. Faqat frontend, mock ma'lumot bilan. Backend — 2-faylda.

---

## 0. TOZALASH

```bash
git checkout -b v2
rm -rf apps/webapp
```

**⚠️ AVVAL BUNI TUZAT — bu butun muammoning sababi edi:**

Saytda `?v=ee86514` qotirib yozilgan. `https://talantly.vercel.app/` ochilsa avtomatik `?v=ee86514` ga redirect bo'ladi — shuning uchun **yangi deploy hech qachon ko'rinmaydi** (Telegram URL bo'yicha keshlaydi, URL o'zgarmaydi).

```bash
grep -rn "ee86514" . --exclude-dir=node_modules --exclude-dir=.git
```

Topilgan joyni (`vercel.json` / `next.config.js` / `middleware.ts`) **butunlay olib tashla**. Qotirilgan hash bilan redirect **boshqa hech qachon yozilmasin**. Kesh-buzuvchi kerak bo'lsa — build vaqtida generatsiya qilinsin (`process.env.VERCEL_GIT_COMMIT_SHA`), qo'lda emas.

**STEP 0:** kod yozishdan oldin reja ber (struktura, komponentlar, tartib). Tasdiqlashimni kut.

---

## 1. STACK
- **Next.js 14** App Router, TypeScript, `apps/webapp`
- CSS Modules yoki vanilla CSS + `tokens.css`. **Tailwind YO'Q**
- Telegram: `window.Telegram.WebApp`
- **Backend chaqiruvi YO'Q** — `src/lib/api.ts` typed interfeys + `src/mock/` data

---

## 2. TELEGRAM POYDEVOR — birinchi bu ishlasin

`src/lib/telegram.ts`:
```ts
// tg.ready()  ← BIRINCHI render effectda (kech = "Mini App not available")
// tg.expand()
// --tg-vh   = tg.viewportStableHeight + 'px'      ← 100vh HECH QACHON
//             tg.onEvent('viewportChanged', ...)
// --tg-top  = safeAreaInset.top + contentSafeAreaInset.top   ← 88px hardcode YO'Q
// --tg-bottom = safeAreaInset.bottom
//             tg.onEvent('safeAreaChanged'/'contentSafeAreaChanged', ...)
// tg.setHeaderColor('#F5F5F7'); tg.setBackgroundColor('#F5F5F7')
// tg.BackButton.show()/hide()  ← o'z strelkamiz YO'Q
// Telegram tashqarisida → QR + "Telegramda oching"
```
```css
.app{ height:var(--tg-vh) }        /* 100vh EMAS */
.screen{ padding-top:var(--tg-top) }
```

⚠️ **20-iyul 2026** — Telegram origin himoyasi yoqiladi: Mini App metodlari faqat asl domendan. Boshqa origin'dan iframe/skript qo'yma (xarita SDK ham).

---

## 3. DIZAYN — 3 fayl yagona manba
`tokens.css` (o'zgartirma) · `talantly-design-system.html` · `talantly-LOYIHA-HANDOFF.md`

**Hardcode YO'Q** — faqat `var(--t-*)`, `var(--r-*)`, `var(--s-*)`, `var(--fs-*)`, `var(--sh-*)`.

**Eng ko'p buziladigan 6 qoida:**
1. `--t-action` (#F26430) **faqat yuza**. Matn/ikonka → `--t-action-ink` (#B8431A). Badge matni → `--t-verified-ink` (#157A42)
2. **Yashil faqat tekshirilgan holat.** Status/progress/"saqlandi" — neytral
3. **Bitta ekran — bitta to'q sariq tugma**
4. Ikonka **HugeIcons Stroke Rounded 1.5px**. Nav 26, tile 26, input/tugma 20, badge 14, muhr 44
5. Tegish maydoni **44px** (ikonka 20 bo'lsa ham `<button>` 44×44)
6. Karta `<div>` emas — **`<button>`**. `:focus-visible`. Hover faqat `@media (hover:hover)`

**Menu bar — qorong'i suzuvchi pill:**
```css
.nav{ position:absolute; left:var(--gutter); right:var(--gutter);
      bottom:calc(16px + var(--tg-bottom)); height:64px; padding:8px; gap:4px;
      background:var(--t-ink-1); border-radius:var(--r-full); box-shadow:var(--sh-nav) }
.nav__i   { flex:0 0 48px; height:48px; border-radius:var(--r-full);
            background:var(--t-ink-nav); color:var(--t-ink-3) }
.nav__i.on{ flex:1 1 auto; background:var(--t-action); color:var(--t-on-action); padding:0 16px }
.nav__lbl { max-width:0; opacity:0 }
.nav__i.on .nav__lbl{ max-width:140px; opacity:1; font-size:15px; font-weight:700 }
```
Faqat **faol** yorliq ko'rsatadi. Ro'yxatga `padding-bottom:96px`. `aria-label` shart.

**Matn:** o'zbek lotin, "siz". Apostrof faqat `'` (U+2019). **Title Case YO'Q.**

---

## 4. KOMPONENTLAR (avval bular)
`Button` (56px, r14) · `Input` (56px, r12) · `Chip` (40px, r999) · `Card` (r18, `--sh-raise`) · `Avatar` · `Badge` · `IconTile` (44×44, r12) · `Sheet` (r24) · `Nav` · `Header` (kontekst — ilova nomi YO'Q) · `EmptyState` · `Progress` · `Skeleton`

**Avatar:** real `photo_url` → o'shani. Yo'q bo'lsa **harf-tile** (birinchi harf, `linear-gradient(135deg,#FFD9A8,#F7A05C)`, matn `#7a3c10`, VK Sans 600, deterministik). Mehmon: `blur(6px)` + `A••••`. **AI yuz / stock / randomuser.me YO'Q.** Gradient — yagona istisno.

---

## 5. EKRANLAR (19)

**Umumiy:** 1 Splash (logo + "TEKSHIRILGAN TALANTLAR" micro) · 2 Rol tanlash (Talant/Izlovchi) · 3 Telegram tashqarisi (QR)

**Talant** — nav: Asosiy · Testlar · Arizalar · Profil
4 **Hub** — keyingi qadam kartasi (bitta orange tugma) + tekshiruv yo'li (5 qadam, ✓ yashil)
5 **Profil formasi** — 4 qadam: ism/tug'ilgan yil/shahar/tuman → yo'nalish/daraja/tajriba → ko'nikma/ish formati/**maosh** → rasm/tavsif/portfolio. CTA = MainButton
6 **Shaxsiyat testi** — savol + 4 javob, progress 4/15, chiqish→sheet, natija: arxetip
7 **Ko'nikma testi** — natija: ball
8 **CV preview** — AI CV + "Yuklab olish"/"Tahrirlash"
9 **Suhbat** — sana chiplari + vaqt grid (band = o'chиq) → tasdiq sheet
10 **Arizalarim** — status pill (Yuborildi/Ko'rildi/Bog'lanildi/Yopildi)
11 **Profil** — o'z kartasi + muhr

**Izlovchi** — nav: Nomzodlar · Doskam · Chat · Ko'proq
12 **Nomzodlar** — qidiruv, filtr chiplari (tuman/yo'nalish/daraja/**maosh**/ish formati), Ro'yxat⟷Xarita
13 **Xarita** — zona doiralari + son ("Chilonzor · 5"), **pin YO'Q**, ko'k me-nuqta, "Taxminiy zona" chip
14 **Nomzod detali** — CV/telefon qulf ostida, sticky "Nomzodni so'rash"
15 **To'lov sheet** — bir martalik / obuna, karta, skrinshot
16 **Chat** — ro'yxat + oyna
17 **Doskam** — 4 tab
18 **Ko'proq** — "+ Vakansiya yaratish" + guruhlangan kartalar
19 **Kompaniya profili**

**Har ekranda empty holat.** Mehmon: blur + ism yashirin → ro'yxat sheet.

**Sticky CTA:** feed/detal/to'lov — `bottom:0` + gradient fade + 16px + `var(--tg-bottom)`.
**Orange hero** — faqat auth/onboarding, o'sha ekranda `setHeaderColor('#F26430')`.

---

## 6. ACCEPTANCE (isbot, "PASS" YO'Q)
1. `npm run typecheck` + lint — natija joyla
2. **`grep -rn "ee86514\|#F26430\|#1F9E58\|100vh\|88px" apps/webapp/src`** → faqat `tokens.css` chiqsin
3. `https://talantly.vercel.app/` **redirect qilmaydi** — curl bilan ko'rsat
4. Telefonda screenshot — nav qorong'i pill, faol yorliqli
5. `--tg-vh`/`--tg-top` JS'dan — kod yo'li
6. Telegram tashqarisida QR
7. 19 ekran yuriydi, har tugma ish bajaradi
8. VK Sans ulangan, apostrof to'g'ri

---

## 7. TARTIB
1. STEP 0 — reja, **to'xta**
2. `ee86514` redirect'ini o'chir
3. Struktura + tokens + font + global.css
4. `telegram.ts` — **birinchi bu ishlasin**
5. Komponentlar
6. Splash → Rol → Talant → Izlovchi
7. Telefonda sina, screenshot

**Ikkilanish → so'ra.**
