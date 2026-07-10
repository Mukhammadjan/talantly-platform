# TALANTLY — MAHSULOT BIBLIYASI (v2)
**Manba haqiqat.** Butun jamoa va Claude Code shu hujjatga amal qiladi. O'zgarish — founder tasdig'i bilan.
Sana: 2026-07-10 · Bosqich: MVP (demo rejim, to'lovsiz)

---

## 1. NIMA QURAMIZ
talantly — O'zbekistondagi **verifikatsiyalangan talant platformasi**. Yoshlarni (intern) va tayyor mutaxassislarni kompaniyalar bilan bog'laydi. Farqimiz: har bir talant **UCH O'LCHAMDA** ko'rsatiladi — buni hh.uz ham, LinkedIn ham qila olmaydi:
1. **KIM** — xarakter/karyera arxetipi (test natijasi)
2. **NIMA QILADI** — mahorat (skill teglar + portfolio + suhbat bahosi)
3. **QANDAY** — jonli suhbat (moderator rubrikasi)

**Moat (ko'chirib bo'lmaydigan ustunlik):** saralangan, jonli tekshirilgan pool + brokerlik ishonchi. Biz **rad etamiz** — muhr shuning uchun qadrli. "Faqat eng yaxshi 20%".

---

## 2. ASOSIY PRINTSIPLAR (buzilmaydi)
- **CV — chiqish, kirish emas.** Avval dalil (skill + portfolio + suhbat + xarakter) → muhr → keyin CV PDF (sovg'a).
- **Verifikatsiya talantга BEPUL.** Filtr = rad etish, pul emas. To'liq xarakter hisoboti = premium (35k). Kompaniya = success fee.
- **Aloqa = mahsulot.** Telefon/Telegram doim admin orqali, to'lovgacha yopiq. Aloqani erta bersak, success fee o'ladi.
- **Talant boshqa talantlarni ko'rmaydi.** Reyting/taqqoslash yo'q — faqat o'z yo'li va o'ziga mos imkoniyatlar.
- **Concierge:** matching qo'lda (admin). Avtomatlashtirish — keyingi faza.
- **Til:** hamma UI o'zbek (lotin), iliq "siz". Kod/kommit ingliz.
- **Brend:** cream #FBF6F0, orange #F26430 (brend), yashil #2FB86B (faqat "Tekshirilgan"). Logo — orange odam-T (assets/brand/). Sloppy UI = FAIL (founder dizayner).

---

## 3. KIRISH OQIMI
1. Bot `/start` → qisqa salom → **"📱 Raqamni ulashish"** tugmasi (bitta bosish, savol yo'q). tg_id + telefon + username saqlanadi.
2. Mini App tugmasi chiqadi → ochadi → initData orqali tanib oladi (ro'yxatdan o'tgan holatда kiradi).
3. **Mini App 1-ekran: ROL TANLASH** — "Men talantman" / "Talant izlayapman". Rol tanlanmaguncha boshqa narsa yo'q. Rol keyin profilда almashtiriladi (bir odam ikkovi ham bo'lishi mumkin).

---

## 4. TALANT OQIMI (dalil → muhr → hujjat)

### 4.1 Profil to'ldirish (wizard — "CV" emas, "profil")
Telefon botда olingan, shuning uchun wizard'da so'ralmaydi. Qadamlar:
1. Ism familiya
2. **Daraja** — 🌱 Intern / 💼 Mutaxassis (mutaxassis → +1 ekran: necha yil + qayerda)
3. Tug'ilgan yil (1985–2012)
4. Shahar (chip)
5. Yo'nalish (chip) + **skill teglar** (yo'nalishga mos, multi-select: React, Figma, SMM, target...)
6. **Ish formati** (multi: Ofis / Masofaviy / Aralash)
7. Ta'lim
8. Tajriba/loyihalar (erkin matn) + **portfolio havolasi**
Har qadam "⬅️ Orqaga". Holat Supabase'da (resume ishlaydi).

### 4.2 Verifikatsiya dvigateli
1. **Xarakter testi** — 15 savol, karyera arxetiplari (§6). Natija profilга **strukturali ma'lumot** bo'lib qo'shiladi (arxetip + trait teglar) + chiroyli hisobot.
2. **Skill dalili** (yo'nalishga mos): MVP'da **portfolio havolasi + yengil skrin-test**. Amaliy topshiriq — Faza 2. (Eslatma: hozirgi `skill_tests`/`test_questions` yengil filtr sifatida qoladi; asosiy signal — portfolio + suhbat.)
3. **Jonli suhbat** — moderator rubrika bilan baholaydi (1–5 + izoh).
4. **Muhr** — dalil bilan: arxetip + skill teglar + skrin ball + suhbat bahosi + shaxs tasdig'i.

### 4.3 Muhrдан keyin
- **CV PDF** — tekshirilgan ma'lumotdan avtomatik yaratiladi (demo: shablon; keyin LLM). Sovg'a, ulashishga tayyor.
- **Bosh ekran:** o'z yo'li (status timeline) + **"Sizga mos so'rovlar"** (yo'nalish+daraja+shahar+formatга mos faol kompaniya so'rovlari — kompaniya nomi ko'rinmaydi) + **"Men tayyorman"** tugmasi (faqat `tekshirilgan` bo'lgach ochiladi; tekshirilmaganга qulf — motivatsiya). Bosdi → `requests` (talant_qiziqishi) + adminга xabar.

---

## 5. IZLOVCHI OQIMI (minimal so'rov → aqlli lenta → brokerlik)

### 5.1 Onboarding (5 qisqa savol, hammasi bosish bilan)
1. Kim sifatida — Kompaniya / Tashkilot / Startup / Shaxsiy
2. Nomi + shahar
3. Faoliyat turi (chip: savdo, IT, xizmat, ishlab chiqarish, ta'lim, boshqa)
4. Kim kerak — Intern / Mutaxassis / Ikkalasi
5. Qachon kerak — Hoziroq / Oy ichida / Ko'rib turibman
**Ish formatini so'ramaymiz** — lentада o'zi filtrlaydi.

### 5.2 Aqlli lenta
Avtomatik moslashgan (yo'nalish + daraja + shahar yaqinligi + faoliyatga mos), ball bo'yicha saralangan. Tab'lar: **Sizga mos · Top mutaxassislar · Yangi tekshirilganlar**. Filtrlar: Yo'nalish · Daraja · Ish formati · Shahar · Ball.

### 5.3 Ko'rinish qatlamlari (MUHIM chegara)
| | Ro'yxatdan o'tgan izlovchi | So'rov yuborgach | To'lovдан keyin |
|---|---|---|---|
| Ism | Dilnoza R. | To'liq | To'liq |
| Arxetip, skill, ball, muhr | ✅ | ✅ | ✅ |
| To'liq CV | ❌ | ✅ (admin orqali) | ✅ |
| Telefon/Telegram | ❌ | ❌ | ✅ |

### 5.4 Bir bosishли so'rov
Kompaniya ma'lumoti oldindan bor → **"Nomzodni so'rash" = bitta bosish** (forma yo'q). → `requests` (kompaniya_sorovi) + adminга to'liq kontekstли xabar (kim, kompaniya, qachon kerak, qaysi nomzod) → "24 soat ichida bog'lanamiz".

### 5.5 Top formulasi (oddiy boshlash)
`skill_ball × 0.6 + suhbat_bahosi × 20 × 0.4`; yangi tekshirilganга 2 hafta "Yangi" ko'tarilishi.

---

## 6. KARYERA ARXETIPLARI (xarakter testi)
6 arxetip (Enneagram nomlari ISHLATILMAYDI): **Yaratuvchi** (kreativ/dizayn) · **Tahlilchi** (data/detal) · **Yetakchi** (boshqaruv) · **Aloqachi** (sotuv/marketing/HR) · **Ijrochi** (barqaror, ishni tugatadi) · **Kashfiyotchi** (startup/g'oya).
- 15 savol, har variant arxetiplarga **og'irlik (weights)** beradi (`personality_questions` formati bazada namuna bilan). Claude Code 3 dan 15 tagacha to'ldiradi.
- Izchillik tekshiruvi: 1 savol ikki xil so'raladi (soxta javobni tutish).
- Natija: eng yuqori arxetip + tagline + kuchli/zaif tomonlar, **karyera kontekstida** (masalan: "Sen — Kashfiyotchi. Startup va kreativ jamoada porlaysing. Zaif joying: bir ishni oxiriga yetkazish").
- Bepul: qisqa natija. Premium (35k): to'liq PDF hisobot.
- Natija `talents.personality` (jsonb) ga yoziladi va kartada/filtрда ishlaydi.

---

## 7. DARAJA VA NARX
- **Intern joylashuvi:** 800k / tech 1.5M so'm (success fee, sinovdan o'tsa).
- **Mutaxassis joylashuvi:** birinchi oylikning ~50%i, minimal 2 mln.
- **Talant:** verifikatsiya bepul; to'liq xarakter hisoboti 35k (premium, ixtiyoriy).
- **"Ishlamasa — to'lamaysiz"** kafolati.
- Demo rejimда (`PAYMENT_ENABLED=false`) hech kim to'lamaydi — narxlar faqat ko'rsatiladi.

---

## 8. ADMIN PANEL (alohida web, to'liq nazorat)
Next.js web + Supabase Auth. Founder/moderator hamma narsani shu yerдан boshqaradi:
- **Talantlar** — jadval + filtr; detal: profil, arxetip, skill teglar, daraja, portfolio, skrin ball, suhbat, status timeline (status_log), CV; amallar: statusни o'zgartirish, testni reset, muhr berish/olib tashlash.
- **Izlovchilar/kompaniyalar** — onboarding ma'lumoti, status pipeline, izohlar.
- **So'rovlar** (`requests`) — ikki tur (kompaniya_sorovi / talant_qiziqishi), status boshqaruvi.
- **Suhbatlar** — slot yaratish (datetime), ro'yxat, baholar.
- **Moslashtirish** — kompaniyaga mos verified talantlarni tanlab, aloqasiz ro'yxat (7 kunlik token bilan ulashish).
- **Xarakter savollari** va **skill savollari** menejeri (qo'shish/tahrirlash/faollashtirish).
- **To'lovlar** — demo'да yashirin/ixtiyoriy.
- **Statistika** — ro'yxat, verifikatsiya, so'rovlar, joylashuvlar; konversiya voronkasi.
Xavfsizlik: middleware, service key faqat serverda, login (signup yo'q).

---

## 9. KELAJAK (MVP'da QILINMAYDI)
Payme/Click API, kompaniya↔talant chat, takliflar boardi, avtomatik matching, amaliy topshiriqlar, mobil ilova, ommaviy web sayt (talantly.uz — domen olingan), ko'p tillilik.

---

## 10. QURISH TARTIBI (Claude Code)
- **Poydevor (tayyor):** baza to'liq migratsiya qilingan (ref fhfrhqhzecdfkahvthgp), 13 jadval, RLS.
- **Prompt 1 — Admin panel web** (to'liq nazorat dashboard, yangi sxemaга quriladi).
- **Prompt 2 — Bot + Mini App evolyutsiyasi** (rol tanlash, yangi wizard, xarakter testi, verifikatsiya-avval-CV, izlovchi onboarding + aqlli lenta + bir bosishли so'rov).
- **Prompt 3 — Ommaviy web sayt** (talantly.uz) + domen ulash + deploy + yakuniy QA.

Guardrail'lar (CLAUDE.md): placeholder yo'q · har bosqichда typecheck+lint + cloud DB dan dalil · har status → status_log · SELF-CHECK REPORT (PASS/FAIL + dalil).
