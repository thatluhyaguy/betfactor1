"use strict";
/**
 * BetFactor Scraper Orchestrator
 *
 * This is the main entry point for the long-running scraper service.
 * Deploy this to Railway or Fly.io — NOT to Vercel (serverless functions
 * have execution time limits unsuited for a persistent polling loop).
 *
 * Each bookmaker runs on its own independent interval so one slow or
 * failing scrape never blocks the others.
 *
 * Startup sequence:
 *  1. Immediate first pass on all bookmakers
 *  2. Set up individual intervals per bookmaker
 *  3. Run arbitrage detection after every successful batch
 */
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const sportpesa_1 = require("./bookmakers/sportpesa");
const betika_1 = require("./bookmakers/betika");
const odibets_1 = require("./bookmakers/odibets");
const redis_client_1 = require("./lib/redis-client");
const postgres_client_1 = require("./lib/postgres-client");
const arbitrage_1 = require("./arbitrage");
/** Per-bookmaker interval in milliseconds */
const SCRAPE_INTERVAL_MS = parseInt(process.env.SCRAPE_INTERVAL_MS ?? '90000', 10); // 90 seconds
/** Max consecutive failures before emitting a high-severity alert */
const FAILURE_ALERT_THRESHOLD = 5;
/** Track consecutive failure count per bookmaker */
const failureCounts = {
    SportPesa: 0,
    Betika: 0,
    Odibets: 0,
};
/** Simple alert emitter — replace body with Slack/Telegram webhook in production */
function emitAlert(bookmaker, consecutiveFails) {
    console.error(`🚨 [ALERT] ${bookmaker} has failed ${consecutiveFails} consecutive times. ` +
        `Likely cause: page structure changed or IP blocked. Manual check required.`);
    // Production: POST to Slack/Telegram webhook here
    // fetch(process.env.ALERT_WEBHOOK_URL, { method: 'POST', body: JSON.stringify({ text: `...` }) });
}
/** Runs a single scraper in a fresh browser context, writes results to Redis + Postgres */
async function runScraper(browser, bookmaker, scraperFn) {
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 },
        locale: 'en-KE',
    });
    const page = await context.newPage();
    try {
        const results = await scraperFn(page);
        // Write each match to Redis and Postgres
        for (const odds of results) {
            await redis_client_1.redisService.setMatchOdds(odds, 900); // 15-minute TTL
            await (0, postgres_client_1.saveOddsSnapshot)(odds);
        }
        // Reset failure counter on success
        if (failureCounts[bookmaker] > 0) {
            console.log(`[${bookmaker}] Recovered after ${failureCounts[bookmaker]} failures.`);
        }
        failureCounts[bookmaker] = 0;
        // Run arbitrage detection after every successful scrape batch
        if (results.length > 0) {
            await (0, arbitrage_1.runArbitrageDetection)();
        }
    }
    catch (err) {
        failureCounts[bookmaker] = (failureCounts[bookmaker] ?? 0) + 1;
        console.error(`[${bookmaker}] Failed (${failureCounts[bookmaker]}): ${err.message}`);
        if (failureCounts[bookmaker] >= FAILURE_ALERT_THRESHOLD) {
            emitAlert(bookmaker, failureCounts[bookmaker]);
        }
    }
    finally {
        await context.close();
    }
}
async function main() {
    console.log('[Orchestrator] Starting BetFactor scraper service...');
    console.log(`[Orchestrator] Scrape interval: ${SCRAPE_INTERVAL_MS / 1000}s per bookmaker`);
    // Launch a single shared browser instance
    const browser = await playwright_1.chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    process.on('SIGTERM', async () => {
        console.log('[Orchestrator] SIGTERM received. Shutting down gracefully...');
        await browser.close();
        process.exit(0);
    });
    // Bookmaker registry
    const scrapers = [
        { name: 'SportPesa', fn: sportpesa_1.scrapeSportPesa },
        { name: 'Betika', fn: betika_1.scrapeBetika },
        { name: 'Odibets', fn: odibets_1.scrapeOdibets },
    ];
    // Immediate first pass — don't wait for the first interval tick
    console.log('[Orchestrator] Running initial scrape pass on all bookmakers...');
    await Promise.allSettled(scrapers.map(({ name, fn }) => runScraper(browser, name, fn)));
    // Schedule each bookmaker on its own staggered interval
    // Stagger by 30s so they don't all hit at the same time
    for (let i = 0; i < scrapers.length; i++) {
        const { name, fn } = scrapers[i];
        const staggerMs = i * 30_000; // 0s, 30s, 60s offsets
        setTimeout(() => {
            console.log(`[${name}] Starting interval at ${SCRAPE_INTERVAL_MS / 1000}s`);
            setInterval(async () => {
                await runScraper(browser, name, fn);
            }, SCRAPE_INTERVAL_MS);
        }, staggerMs);
    }
    console.log('[Orchestrator] All scrapers scheduled. Service is running.');
}
main().catch((err) => {
    console.error('[Orchestrator] Fatal error:', err);
    process.exit(1);
});
