# Build context = monorepo root (see railway.json dockerfilePath)
FROM node:20-slim

ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

# Workspace manifests first for layer caching
COPY package.json package-lock.json ./
COPY apps/bot/package.json apps/bot/
COPY apps/admin/package.json apps/admin/
COPY apps/web/package.json apps/web/
COPY apps/webapp/package.json apps/webapp/
COPY packages/shared/package.json packages/shared/

RUN npm ci --omit=dev --workspace apps/bot

# Chromium + system deps for the CV PDF renderer
RUN npx playwright install --with-deps chromium \
  && rm -rf /var/lib/apt/lists/*

COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/bot ./apps/bot

CMD ["node", "--import", "tsx", "apps/bot/src/index.ts"]
