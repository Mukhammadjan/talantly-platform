import type { Bot } from "grammy";
import { InputFile } from "grammy";
import { chromium, type Browser } from "playwright";
import { renderCvHtml, type CvProfileRow } from "@talantly/shared";
import { getSupabase } from "../db/client.js";
import * as cvProfilesRepo from "../db/cvProfilesRepo.js";
import * as talentsRepo from "../db/talentsRepo.js";
import * as usersRepo from "../db/usersRepo.js";
import { profileKeyboard } from "../keyboards.js";
import { cvReadyMessage } from "../text.js";

const POLL_INTERVAL_MS = 10_000;
const CV_BUCKET = "cv-pdfs";

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }
  browserInstance = await chromium.launch();
  return browserInstance;
}

async function renderPdf(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "networkidle" });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
  } finally {
    await page.close();
  }
}

function pdfFileName(fullName: string | null): string {
  const base = (fullName ?? "talant")
    .trim()
    .split(/\s+/)[0]
    ?.replace(/[^\p{L}\p{N}]/gu, "");
  return `Talantly_CV_${base || "talant"}.pdf`;
}

async function processRow(bot: Bot, row: CvProfileRow): Promise<void> {
  if (!row.talent_id) {
    console.warn(`cv_profiles ${row.id} has no talent_id, skipping`);
    return;
  }
  const talent = await talentsRepo.findById(row.talent_id);
  if (!talent) {
    console.warn(`cv_profiles ${row.id}: talent ${row.talent_id} not found`);
    return;
  }
  const user = talent.user_id ? await usersRepo.findById(talent.user_id) : null;

  const html = renderCvHtml({
    fullName: talent.full_name ?? "Nomzod",
    birthYear: talent.birth_year,
    city: talent.city,
    direction: talent.direction,
    phone: user?.phone ?? null,
    portfolioUrl: talent.portfolio_url,
    cv: {
      summary: row.summary ?? "",
      skills: row.skills ?? [],
      experience: row.experience ?? [],
      aiVerdict: row.ai_verdict ?? "",
    },
    generatedAt: row.generated_at ?? new Date().toISOString(),
  });
  const pdf = await renderPdf(html);

  const storagePath = `${talent.id}/cv.pdf`;
  const { error: uploadError } = await getSupabase()
    .storage.from(CV_BUCKET)
    .upload(storagePath, pdf, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (uploadError) {
    throw new Error(
      `cv-pdfs upload failed for talent ${talent.id}: ${uploadError.message}`,
    );
  }

  await cvProfilesRepo.setPdfPath(row.id, storagePath);

  if (talent.status === "tolov_tasdiqlangan" && user) {
    await talentsRepo.setStatus(talent, "cv_tayyor", user.id);
  }

  if (user?.tg_id) {
    const keyboard = profileKeyboard();
    await bot.api.sendDocument(
      user.tg_id,
      new InputFile(pdf, pdfFileName(talent.full_name)),
      {
        caption: cvReadyMessage(talent.full_name),
        ...(keyboard ? { reply_markup: keyboard } : {}),
      },
    );
  }
  console.log(`CV PDF ready for talent ${talent.id} (${storagePath})`);
}

export function startCvPdfWorker(bot: Bot): void {
  let running = false;

  const tick = async (): Promise<void> => {
    if (running) return;
    running = true;
    try {
      const pending = await cvProfilesRepo.findPendingPdf();
      for (const row of pending) {
        try {
          await processRow(bot, row);
        } catch (err) {
          console.error(`CV PDF processing failed for ${row.id}:`, err);
        }
      }
    } catch (err) {
      console.error("CV PDF worker tick failed:", err);
    } finally {
      running = false;
    }
  };

  setInterval(() => void tick(), POLL_INTERVAL_MS);
  void tick();
  console.log("CV PDF worker started.");
}

export async function stopCvPdfBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close().catch(() => undefined);
    browserInstance = null;
  }
}
