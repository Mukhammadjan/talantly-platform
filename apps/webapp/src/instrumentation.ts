// Deploy hook (spec §8): har production deploy'da bot menu tugmasi
// avtomatik ?v=<commit> bilan yangilanadi. Qo'lda qotirish TAQIQLANGAN —
// v1 aynan shu sabab o'lgan edi.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.VERCEL_ENV !== "production") return;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
  if (!token || !sha) return;

  const url = `https://talantly.vercel.app/?v=${sha}`;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/setChatMenuButton`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menu_button: { type: "web_app", text: "Ochish", web_app: { url } },
        }),
      },
    );
    console.log(`[deploy-hook] menu -> ?v=${sha} (${res.status})`);
  } catch (err) {
    console.error("[deploy-hook] setChatMenuButton failed", err);
  }
}
