import { describe, expect, it } from "vitest";
import { generateCv, type CvInput } from "@talantly/shared";

const baseInput: CvInput = {
  fullName: "Aziza Karimova",
  birthYear: 2003,
  city: "Toshkent",
  direction: "dasturlash",
  education: "TATU, dasturiy injiniring",
  freeText:
    "JavaScript va React o'rganganman, kichik telegram bot loyihasi qilganman",
  portfolioUrl: null,
};

describe("generateCv", () => {
  it("produces a complete CvJson", () => {
    const cv = generateCv(baseInput);
    expect(cv.summary.length).toBeGreaterThan(50);
    expect(cv.skills.length).toBeGreaterThanOrEqual(3);
    expect(cv.skills.length).toBeLessThanOrEqual(9);
    expect(cv.experience.length).toBeGreaterThanOrEqual(2);
    expect(cv.aiVerdict.length).toBeGreaterThan(30);
    for (const item of cv.experience) {
      expect(item.title).toBeTruthy();
      expect(item.bullets.length).toBeGreaterThan(0);
    }
  });

  it("is deterministic for the same input", () => {
    expect(generateCv(baseInput)).toEqual(generateCv(baseInput));
  });

  it("extracts keyword skills without substring false positives", () => {
    const cv = generateCv(baseInput);
    expect(cv.skills).toContain("JavaScript");
    expect(cv.skills).toContain("React");
    expect(cv.skills).toContain("Telegram botlar");
    expect(cv.skills).not.toContain("Java");
  });

  it("varies output between different people", () => {
    const other = generateCv({
      ...baseInput,
      fullName: "Bekzod Tursunov",
      direction: "marketing",
      freeText: "Instagram sahifalar yuritganman, kontent yozaman",
    });
    const first = generateCv(baseInput);
    expect(other.summary).not.toEqual(first.summary);
    expect(other.skills).toContain("Instagram marketing");
  });

  it("mentions the portfolio when provided", () => {
    const cv = generateCv({
      ...baseInput,
      portfolioUrl: "https://github.com/aziza",
    });
    const hasPortfolioItem = cv.experience.some(
      (item) => item.org === "https://github.com/aziza",
    );
    expect(hasPortfolioItem).toBe(true);
  });
});
