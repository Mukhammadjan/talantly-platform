import type { Direction } from "../types.js";
import { DIRECTION_LABELS_UZ } from "../constants.js";
import type { CvJson } from "./generate.js";

export interface CvPdfParams {
  fullName: string;
  birthYear: number | null;
  city: string | null;
  direction: Direction | null;
  phone: string | null;
  portfolioUrl: string | null;
  cv: CvJson;
  generatedAt: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDateUz(iso: string): string {
  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentyabr",
    "oktyabr",
    "noyabr",
    "dekabr",
  ];
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()}-${months[d.getMonth()]}, ${d.getFullYear()}`;
}

const SEAL_SVG = `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="22" r="22" fill="#2FB86B"/><path d="M13 22.5L19 28.5L31 16.5" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function renderCvHtml(params: CvPdfParams): string {
  const { cv } = params;
  const name = escapeHtml(params.fullName);
  const directionLabel = params.direction
    ? escapeHtml(DIRECTION_LABELS_UZ[params.direction])
    : "";

  const metaItems: string[] = [];
  if (params.city) metaItems.push(escapeHtml(params.city));
  if (params.birthYear) metaItems.push(`${params.birthYear}-yil`);
  if (params.phone) metaItems.push(escapeHtml(params.phone));

  const skillsHtml = cv.skills
    .map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`)
    .join("");

  const experienceHtml = cv.experience
    .map(
      (item) => `
      <div class="exp">
        <div class="exp-head">
          <div>
            <p class="exp-title">${escapeHtml(item.title)}</p>
            <p class="exp-org">${escapeHtml(item.org)}</p>
          </div>
          <span class="exp-period">${escapeHtml(item.period)}</span>
        </div>
        <ul class="exp-bullets">
          ${item.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}
        </ul>
      </div>`,
    )
    .join("");

  const portfolioHtml = params.portfolioUrl
    ? `<p class="portfolio">Portfolio: <span class="portfolio-url">${escapeHtml(params.portfolioUrl)}</span></p>`
    : "";

  return `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: #FBF6F0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #191512;
    padding: 40px 44px;
    font-size: 13px;
    line-height: 1.55;
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }
  .brand {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
  .brand .dot { color: #F26430; }
  .verified {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .verified-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #1F9E58;
    text-align: right;
  }
  .header-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 26px 28px;
    border: 1px solid #EAE2D8;
    margin-bottom: 16px;
  }
  h1 {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
  .direction {
    display: inline-block;
    margin-top: 8px;
    background: #F26430;
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 5px 14px;
    border-radius: 999px;
  }
  .meta {
    margin-top: 12px;
    color: #6B625B;
    font-size: 12px;
  }
  .meta span + span::before {
    content: "•";
    margin: 0 8px;
    color: #EAE2D8;
  }
  .card {
    background: #ffffff;
    border-radius: 20px;
    padding: 22px 28px;
    border: 1px solid #EAE2D8;
    margin-bottom: 16px;
  }
  .label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #F0530A;
    margin-bottom: 10px;
  }
  .summary { color: #191512; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    background: rgba(242, 100, 48, 0.08);
    border: 1px solid rgba(242, 100, 48, 0.35);
    color: #191512;
    font-size: 11.5px;
    font-weight: 600;
    padding: 5px 13px;
    border-radius: 999px;
  }
  .exp { padding: 12px 0; }
  .exp + .exp { border-top: 1px solid #EAE2D8; }
  .exp-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }
  .exp-title { font-size: 14px; font-weight: 700; }
  .exp-org { color: #6B625B; font-size: 12px; margin-top: 1px; }
  .exp-period {
    color: #6B625B;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    background: #FBF6F0;
    border-radius: 999px;
    padding: 4px 12px;
  }
  .exp-bullets { margin-top: 8px; padding-left: 18px; color: #191512; }
  .exp-bullets li { margin-bottom: 3px; }
  .verdict-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 22px 28px;
    border: 1.5px solid #2FB86B;
    margin-bottom: 16px;
  }
  .verdict-card .label { color: #1F9E58; }
  .portfolio { margin-top: 10px; font-size: 12px; color: #6B625B; }
  .portfolio-url { color: #F0530A; font-weight: 600; }
  .footer {
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
    color: #6B625B;
    font-size: 10.5px;
  }
</style>
</head>
<body>
  <div class="top">
    <p class="brand">talantly<span class="dot">.uz</span></p>
    <div class="verified">
      <p class="verified-label">AI tomonidan<br/>tayyorlangan CV</p>
      ${SEAL_SVG}
    </div>
  </div>

  <div class="header-card">
    <h1>${name}</h1>
    ${directionLabel ? `<span class="direction">${directionLabel}</span>` : ""}
    ${metaItems.length > 0 ? `<p class="meta">${metaItems.map((m) => `<span>${m}</span>`).join("")}</p>` : ""}
  </div>

  <div class="card">
    <p class="label">Qisqacha</p>
    <p class="summary">${escapeHtml(cv.summary)}</p>
    ${portfolioHtml}
  </div>

  <div class="card">
    <p class="label">Ko'nikmalar</p>
    <div class="chips">${skillsHtml}</div>
  </div>

  <div class="card">
    <p class="label">Tajriba va tayyorgarlik</p>
    ${experienceHtml}
  </div>

  <div class="verdict-card">
    <p class="label">AI xulosasi</p>
    <p class="summary">${escapeHtml(cv.aiVerdict)}</p>
  </div>

  <div class="footer">
    <span>talantly.uz — tekshirilgan amaliyotchilar platformasi</span>
    <span>${formatDateUz(params.generatedAt)}</span>
  </div>
</body>
</html>`;
}
