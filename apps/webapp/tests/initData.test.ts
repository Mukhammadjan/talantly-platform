import { createHmac } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { verifyInitData } from "@/lib/server/initData";

const BOT_TOKEN = "1234567890:TEST_FAKE_TOKEN_for_unit_tests_only";

function buildInitData(
  botToken: string,
  overrides: Record<string, string> = {},
): string {
  const fields: Record<string, string> = {
    auth_date: String(Math.floor(Date.now() / 1000)),
    query_id: "AAF_test_query",
    user: JSON.stringify({
      id: 987654321,
      first_name: "Test",
      username: "test_user",
    }),
    ...overrides,
  };
  const dataCheckString = Object.entries(fields)
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");
  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const hash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
  const params = new URLSearchParams(fields);
  params.set("hash", hash);
  return params.toString();
}

describe("verifyInitData", () => {
  it("accepts valid initData signed with the bot token", () => {
    const initData = buildInitData(BOT_TOKEN);
    const result = verifyInitData(initData, BOT_TOKEN);
    expect(result).not.toBeNull();
    expect(result?.user.id).toBe(987654321);
    expect(result?.user.first_name).toBe("Test");
  });

  it("rejects initData with a tampered hash", () => {
    const initData = buildInitData(BOT_TOKEN);
    const params = new URLSearchParams(initData);
    const hash = params.get("hash") ?? "";
    const flipped = (hash[0] === "a" ? "b" : "a") + hash.slice(1);
    params.set("hash", flipped);
    expect(verifyInitData(params.toString(), BOT_TOKEN)).toBeNull();
  });

  it("rejects initData with tampered payload (user swapped after signing)", () => {
    const initData = buildInitData(BOT_TOKEN);
    const params = new URLSearchParams(initData);
    params.set(
      "user",
      JSON.stringify({ id: 1, first_name: "Attacker" }),
    );
    expect(verifyInitData(params.toString(), BOT_TOKEN)).toBeNull();
  });

  it("rejects initData signed with a different bot token", () => {
    const initData = buildInitData("999:OTHER_TOKEN");
    expect(verifyInitData(initData, BOT_TOKEN)).toBeNull();
  });

  it("rejects stale initData (auth_date older than max age)", () => {
    const stale = String(Math.floor(Date.now() / 1000) - 60 * 60 * 25);
    const initData = buildInitData(BOT_TOKEN, { auth_date: stale });
    expect(verifyInitData(initData, BOT_TOKEN)).toBeNull();
  });

  it("rejects empty and malformed input", () => {
    expect(verifyInitData("", BOT_TOKEN)).toBeNull();
    expect(verifyInitData("hash=nothex", BOT_TOKEN)).toBeNull();
    expect(verifyInitData("auth_date=1", BOT_TOKEN)).toBeNull();
  });
});

describe("POST /api/auth/validate (route handler)", () => {
  beforeAll(() => {
    process.env.TELEGRAM_BOT_TOKEN = BOT_TOKEN;
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    process.env.WEBAPP_JWT_SECRET = "test-jwt-secret";
  });

  it("returns 401 for tampered initData", async () => {
    const { POST } = await import("@/app/api/auth/validate/route");
    const initData = buildInitData(BOT_TOKEN);
    const params = new URLSearchParams(initData);
    params.set("hash", "0".repeat(64));
    const request = new Request("http://localhost/api/auth/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: params.toString() }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe("Avtorizatsiya talab qilinadi.");
  });

  it("returns 400 when initData is missing", async () => {
    const { POST } = await import("@/app/api/auth/validate/route");
    const request = new Request("http://localhost/api/auth/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
