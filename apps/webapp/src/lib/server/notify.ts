import { serverEnv } from "./env";

export async function notifyAdmin(text: string): Promise<void> {
  const adminTgId = serverEnv.adminTgId;
  if (!adminTgId) {
    console.warn("notifyAdmin skipped: ADMIN_TG_ID is not set");
    return;
  }
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${serverEnv.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: adminTgId, text }),
      },
    );
    if (!response.ok) {
      console.error(
        `notifyAdmin failed: HTTP ${response.status} ${await response.text()}`,
      );
    }
  } catch (err) {
    console.error("notifyAdmin failed:", err);
  }
}
