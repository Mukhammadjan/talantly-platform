# Bot deploy — Railway

The Telegram bot (`apps/bot`) runs as a single long-lived Railway service.
The web apps stay on Vercel; only the bot lives here.

## What is already in the repo

| File | Role |
| --- | --- |
| `railway.json` | Builder = Dockerfile, healthcheck on `/healthz`, always restart |
| `apps/bot/Dockerfile` | Build context is the **monorepo root**, not `apps/bot` |
| `.dockerignore` | Keeps `node_modules`, `.next`, `.env*` and `.git` out of the image |

The image installs only the bot workspace (`npm ci --omit=dev --workspace
apps/bot`) plus Chromium, which the CV PDF renderer needs.

## One-time setup

1. **New project** → *Deploy from GitHub repo* → pick this repo, branch `main`.
2. Railway reads `railway.json` on its own — no build/start command to type.
   The image is built from `apps/bot/Dockerfile` with the repo root as context.
3. **Settings → Networking → Generate Domain.** This is not optional: it sets
   `RAILWAY_PUBLIC_DOMAIN`, which is what switches the bot into webhook mode.
   Without it the bot falls back to long polling — still functional, but you
   lose the webhook path.
4. Add the variables below, then redeploy.

## Variables

Required — the bot exits on boot without them:

```
TELEGRAM_BOT_TOKEN
SUPABASE_V2_URL
SUPABASE_V2_ANON_KEY
SUPABASE_V2_SERVICE_ROLE_KEY
WEBAPP_JWT_SECRET
ADMIN_TG_ID
ADMIN_USERNAME
WEBAPP_URL
```

Feature-dependent:

```
ANTHROPIC_API_KEY        AI CV generation
PAYMENT_CARD_NUMBER      shown in the manual payment step
PAYMENT_CARD_OWNER
PAYMENT_ENABLED          "false" hides the payment step entirely
CHANNEL_URL              optional channel link in the menu
```

Deploy-specific:

```
PORT           Railway injects this; the bot defaults to 8080
WEBHOOK_URL    only if you front the bot with a custom domain — otherwise
               leave it unset and let RAILWAY_PUBLIC_DOMAIN do the work
```

`WEBAPP_JWT_SECRET` **must** be byte-identical to the one in the Vercel
webapp project. The bot signs Mini App sessions with it and the webapp
verifies them; a mismatch logs every user out with no visible error.

## Webhook vs long polling

The bot picks its mode at boot:

- `WEBHOOK_URL` set → webhook at `<WEBHOOK_URL>/telegram-webhook`
- else `RAILWAY_PUBLIC_DOMAIN` set → webhook at `https://<domain>/telegram-webhook`
- else → long polling, and any stale webhook is deleted first so Telegram
  does not answer 409

The webhook secret token is derived from the bot token (HMAC-SHA256), so it
needs no variable of its own and rotates automatically when the bot token does.

`/healthz` is served in **both** modes, so the Railway healthcheck passes even
when the service is polling.

## Verifying a deploy

```bash
curl -s https://<your-domain>/healthz            # → ok
curl -s "https://api.telegram.org/bot<TOKEN>/getWebhookInfo" | jq
```

`getWebhookInfo` should show your `/telegram-webhook` URL, `pending_update_count: 0`
and no `last_error_message`. Then send `/start` to the bot.

## Gotchas

- **Only one process may consume updates.** If a local `npm run dev:bot` is
  running against the same token while Railway holds the webhook, Telegram
  returns 409 and one of them goes deaf. Stop the local one.
- **Chromium is ~400 MB of image.** It is only there for the CV PDF; if PDF
  generation moves elsewhere, drop the `playwright install` layer and the
  image shrinks by roughly half.
- **Changing the bot token** invalidates the derived webhook secret. Redeploy
  after rotating it so `setWebhook` runs again.
- Railway restarts on every crash (`restartPolicyType: ALWAYS`). A boot-time
  config error therefore shows up as a restart loop, not a single failure —
  check the deploy logs for the first `Fatal` line.
