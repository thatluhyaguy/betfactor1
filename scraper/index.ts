/**
 * BetFactor Scraper Orchestrator
 * Deploy to Railway — runs a persistent polling loop on live Kenyan bookmaker odds.
 */

import { chromium, Browser } from 'playwright';
import { scrapeSportPesa } from './bookmakers/sportpesa';
import { scrapeBetika } from './bookmakers/betika';
import { scrapeOdibets } from './bookmakers/odibets';
import { redisService } from './lib/redis-client';
import { saveOddsSnapshot } from './lib/postgres-client';
import { runArbitrageDetection } from './arbitrage';
import * as fs from 'fs';

const SCRAPE_INTERVAL_MS = parseInt(process.env.SCRAPE_INTERVAL_MS ?? '90000', 10);
const FAILURE_ALERT_THRESHOLD = 5;

const failureCounts: Record<string, number> = {
  SportPesa: 0,
  Betika: 0,
  Odibets: 0,
};

function emitAlert(bookmaker: string, consecutiveFails: number): void {
  console.error(
    `🚨 [ALERT] ${bookmaker} has failed ${consecutiveFails} consecutive times.`
  );
}

async function runScraper(
  browser: Browser,
  bookmaker: string,
  scraperFn: (page: any) => Promise<any[]>
): Promise<void> {
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-KE',
  });
  const page = await context.newPage();

  try {
    const results = await scraperFn(page);

    for (const odds of results) {
      await redisService.setMatchOdds(odds, 900);
      await saveOddsSnapshot(odds);
    }

    if (failureCounts[bookmaker] > 0) {
      console.log(`[${bookmaker}] Recovered after ${failureCounts[bookmaker]} failures.`);
    }
    failureCounts[bookmaker] = 0;

    if (results.length > 0) {
      await runArbitrageDetection();
    }
  } catch (err: any) {
    failureCounts[bookmaker] = (failureCounts[bookmaker] ?? 0) + 1;
    console.error(`[${bookmaker}] Failed (${failureCounts[bookmaker]}): ${err.message}`);

    if (failureCounts[bookmaker] >= FAILURE_ALERT_THRESHOLD) {
      emitAlert(bookmaker, failureCounts[bookmaker]);
    }
  } finally {
    await context.close();
  }
}

/** Helper to find available chromium binary on Linux systems */
function findSystemChromium(): string | undefined {
  const candidatePaths = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
  ];
  for (const p of candidatePaths) {
    if (p && fs.existsSync(p)) return p;
  }
  return undefined;
}

async function launchBrowser(): Promise<Browser> {
  const launchOptions: any = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  };

  const sysPath = findSystemChromium();
  if (sysPath) {
    console.log(`[Orchestrator] Using system Chromium at: ${sysPath}`);
    launchOptions.executablePath = sysPath;
  }

  try {
    return await chromium.launch(launchOptions);
  } catch (err: any) {
    console.warn(`[Orchestrator] First launch attempt failed: ${err.message}. Retrying default chromium...`);
    delete launchOptions.executablePath;
    return await chromium.launch(launchOptions);
  }
}

async function main(): Promise<void> {
  console.log('[Orchestrator] Starting BetFactor scraper service...');
  console.log(`[Orchestrator] Scrape interval: ${SCRAPE_INTERVAL_MS / 1000}s per bookmaker`);

  const browser = await launchBrowser();

  process.on('SIGTERM', async () => {
    console.log('[Orchestrator] SIGTERM received. Shutting down gracefully...');
    await browser.close();
    process.exit(0);
  });

  const scrapers: Array<{ name: string; fn: (page: any) => Promise<any[]> }> = [
    { name: 'SportPesa', fn: scrapeSportPesa },
    { name: 'Betika', fn: scrapeBetika },
    { name: 'Odibets', fn: scrapeOdibets },
  ];

  console.log('[Orchestrator] Running initial scrape pass on all bookmakers...');
  await Promise.allSettled(
    scrapers.map(({ name, fn }) => runScraper(browser, name, fn))
  );

  for (let i = 0; i < scrapers.length; i++) {
    const { name, fn } = scrapers[i];
    const staggerMs = i * 30_000;

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
