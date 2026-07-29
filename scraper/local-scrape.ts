/**
 * BetFactor — Local/cPanel Scrape Run
 *
 * Runs once (called by cron on a schedule, e.g. hourly), scrapes real odds only,
 * writes results to src/data/matches.json, and exits.
 *
 * IMPORTANT: This intentionally does NOT fabricate or synthesize odds for
 * bookmakers that return zero results. A "sure bet" on this site must only ever
 * be built from odds that were actually observed on a real bookmaker page —
 * inventing plausible-looking numbers and presenting them as live data risks
 * a real user losing real money acting on a fictional arbitrage opportunity.
 * If a bookmaker's scraper is broken, its matches are simply absent from the
 * output until the selector is fixed — never backfilled with guesses.
 */

import { chromium, Browser, Page } from 'playwright';
import { scrapeSportPesa } from './bookmakers/sportpesa';
import { scrapeBetika } from './bookmakers/betika';
import { scrapeOdibets } from './bookmakers/odibets';
import { ScrapedMatchOdds } from './lib/normalize';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const STALE_THRESHOLD_MS = 5 * 60 * 1000;

interface ArbResult {
  matchSlug: string;
  homeTeam: string;
  awayTeam: string;
  margin: number;
  bestHomeBookmaker: string;
  bestHomeOdds: number;
  bestDrawBookmaker: string;
  bestDrawOdds: number;
  bestAwayBookmaker: string;
  bestAwayOdds: number;
  detectedAt: string;
}

function isFresh(scrapedAt: string): boolean {
  return Date.now() - new Date(scrapedAt).getTime() < STALE_THRESHOLD_MS;
}

function isSane(odds: number): boolean {
  return odds >= 1.01 && odds <= 100;
}

/**
 * Same detection math as scraper/arbitrage.ts, but operating on an in-memory
 * array of THIS RUN's real scraped odds — no Redis, no database, no synthetic backfill.
 * Requires at least 2 different bookmakers reporting the same match to compare.
 */
function detectArbitrage(allOdds: ScrapedMatchOdds[]): ArbResult[] {
  const opportunities: ArbResult[] = [];
  const byMatch = new Map<string, ScrapedMatchOdds[]>();

  for (const o of allOdds) {
    if (!byMatch.has(o.matchSlug)) byMatch.set(o.matchSlug, []);
    byMatch.get(o.matchSlug)!.push(o);
  }

  for (const [matchSlug, oddsForMatch] of byMatch.entries()) {
    const fresh = oddsForMatch.filter(
      (o) => isFresh(o.scrapedAt) && isSane(o.homeOdds) && isSane(o.drawOdds) && isSane(o.awayOdds)
    );

    // Require at least 2 DISTINCT bookmakers — not just 2 records
    const distinctBookmakers = new Set(fresh.map((o) => o.bookmaker));
    if (distinctBookmakers.size < 2) continue;

    let bestHomeOdds = 0, bestHomeBookmaker = '';
    let bestDrawOdds = 0, bestDrawBookmaker = '';
    let bestAwayOdds = 0, bestAwayBookmaker = '';
    let homeTeam = '', awayTeam = '';

    for (const o of fresh) {
      if (o.homeOdds > bestHomeOdds) { bestHomeOdds = o.homeOdds; bestHomeBookmaker = o.bookmaker; }
      if (o.drawOdds > bestDrawOdds) { bestDrawOdds = o.drawOdds; bestDrawBookmaker = o.bookmaker; }
      if (o.awayOdds > bestAwayOdds) { bestAwayOdds = o.awayOdds; bestAwayBookmaker = o.bookmaker; }
      if (!homeTeam) { homeTeam = o.homeTeam; awayTeam = o.awayTeam; }
    }

    const impliedSum = 1 / bestHomeOdds + 1 / bestDrawOdds + 1 / bestAwayOdds;

    if (impliedSum < 1) {
      const margin = parseFloat(((1 - impliedSum) * 100).toFixed(4));
      opportunities.push({
        matchSlug, homeTeam, awayTeam, margin,
        bestHomeBookmaker, bestHomeOdds,
        bestDrawBookmaker, bestDrawOdds,
        bestAwayBookmaker, bestAwayOdds,
        detectedAt: new Date().toISOString(),
      });
      console.log(`[Arbitrage] ✅ ${matchSlug}: margin ${margin.toFixed(2)}%`);
    }
  }

  return opportunities;
}

async function runScraper(
  browser: Browser,
  bookmaker: string,
  scraperFn: (page: Page) => Promise<ScrapedMatchOdds[]>
): Promise<ScrapedMatchOdds[]> {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-KE',
    extraHTTPHeaders: { 'Accept-Language': 'en-KE,en;q=0.9' },
  });
  const page = await context.newPage();

  try {
    const results = await scraperFn(page);
    console.log(`[${bookmaker}] Scraped ${results.length} matches`);
    return results;
  } catch (err: any) {
    console.error(`[${bookmaker}] Scrape error: ${err.message}`);
    return []; // empty on failure — NEVER backfilled with fake data
  } finally {
    await context.close();
  }
}

async function run() {
  console.log(`[${new Date().toISOString()}] Starting scrape run...`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  let allOdds: ScrapedMatchOdds[] = [];
  const bookmakerStatus: Record<string, number> = {};

  try {
    const scrapers: Array<{ name: string; fn: (page: Page) => Promise<ScrapedMatchOdds[]> }> = [
      { name: 'SportPesa', fn: scrapeSportPesa },
      { name: 'Betika', fn: scrapeBetika },
      { name: 'Odibets', fn: scrapeOdibets },
    ];

    const results = await Promise.allSettled(
      scrapers.map(({ name, fn }) => runScraper(browser, name, fn))
    );

    results.forEach((r, i) => {
      const name = scrapers[i].name;
      if (r.status === 'fulfilled') {
        allOdds.push(...r.value);
        bookmakerStatus[name] = r.value.length;
      } else {
        bookmakerStatus[name] = 0;
        console.error(`[${name}] Failed entirely:`, r.reason);
      }
    });
  } finally {
    await browser.close();
  }

  if (allOdds.length === 0) {
    console.error('No odds scraped from ANY bookmaker — aborting write to avoid wiping existing (still-valid) data.');
    process.exit(1);
  }

  const arbitrageOpportunities = detectArbitrage(allOdds);

  const output = {
    lastUpdated: new Date().toISOString(),
    bookmakerStatus, // honest record of what actually worked this run — surface this in admin/scraper-health page
    matches: allOdds,
    arbitrageOpportunities,
  };

  const outputDir = join(__dirname, '../src/data');
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, 'matches.json');
  writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`Wrote ${allOdds.length} real odds records (${JSON.stringify(bookmakerStatus)}), ${arbitrageOpportunities.length} genuine arb opportunities.`);
}

run().catch((err) => {
  console.error('Fatal error in scrape run:', err);
  process.exit(1);
});
