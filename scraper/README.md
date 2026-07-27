# BetFactor Scraper

Long-running Node.js service that scrapes live odds from Kenyan bookmakers and writes them to Redis + Postgres so the BetFactor frontend can display live arbitrage opportunities.

---

## Stack
- **Playwright** – headless Chromium for browser-based scraping + XHR interception
- **ioredis** – Redis client (falls back to in-memory if `REDIS_URL` is not set)
- **Prisma** – writes odds snapshots and arb opportunities to the shared Postgres DB
- **TypeScript** – compiled to CommonJS via `tsc`

---

## Local Development

### 1. Install dependencies
```bash
cd scraper
npm install
npx playwright install chromium --with-deps
```

### 2. Create your `.env`
```bash
cp .env.example .env
# Fill in DATABASE_URL and REDIS_URL
```

### 3. Run in dev mode (ts-node, no compile step)
```bash
npm run dev
```

You should see:
```
[Orchestrator] Starting BetFactor scraper service...
[Orchestrator] Running initial scrape pass on all bookmakers...
[SportPesa] Scraped 4 matches at 2024-...
[Betika] Scraped 5 matches at 2024-...
[Odibets] Scraped 3 matches at 2024-...
[Arbitrage] ✅ arsenal-vs-chelsea: margin 1.23% ...
```

### 4. Build for production
```bash
npm run build        # outputs to dist/
npm start            # runs dist/index.js
```

---

## Deploying to Fly.io (free tier)

### Prerequisites
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Log in
fly auth login
```

### First deploy
```bash
cd scraper

# Launch (uses fly.toml — just confirm prompts)
fly launch --no-deploy

# Set secrets (from your Vercel environment variables)
fly secrets set DATABASE_URL="postgres://..." \
               REDIS_URL="rediss://..." \
               SCRAPE_INTERVAL_MS="90000"

# Deploy
fly deploy
```

### View logs
```bash
fly logs
```

### Re-deploy after code changes
```bash
npm run build
fly deploy
```

---

## Redis (Upstash)

1. Go to [https://upstash.com](https://upstash.com) → Create database → Region: **eu-west-1** (closest to Kenya)
2. Copy the **Redis REST URL** (starts with `rediss://`)
3. Paste as `REDIS_URL` in both:
   - Vercel environment variables (for the Next.js API routes)
   - Fly.io secrets (for the scraper)

---

## Bookmaker Selector Maintenance

Each bookmaker scraper uses **XHR interception** — it loads the bookmaker page and captures the JSON response from their internal API call. This is more stable than CSS selectors, but bookmakers do occasionally change their API paths.

If a scraper starts returning 0 results:
1. Open the bookmaker site in Chrome DevTools → Network tab → filter by `XHR`
2. Find the request that returns match data (usually named `matches`, `events`, or `sport`)
3. Update the `URL_PATTERN` constant at the top of the relevant scraper file

---

## Architecture

```
scraper/
├── index.ts                  # Orchestrator — schedules all scrapers
├── arbitrage.ts              # Arbitrage detection engine
├── bookmakers/
│   ├── sportpesa.ts          # SportPesa KE scraper
│   ├── betika.ts             # Betika KE scraper
│   └── odibets.ts            # Odibets KE scraper
└── lib/
    ├── normalize.ts          # Team name → canonical slug
    ├── redis-client.ts       # Redis + in-memory fallback
    └── postgres-client.ts    # Prisma write helpers
```
