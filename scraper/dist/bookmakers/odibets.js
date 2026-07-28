"use strict";
/**
 * Odibets Kenya Scraper
 *
 * Strategy: Intercept Odibets' internal API response. Odibets is partially
 * SSR but loads live odds via XHR after the initial page render.
 *
 * Known endpoint pattern (inspect if this breaks):
 *   https://www.odibets.com/api/game/games?sport=soccer
 *   OR
 *   https://api.odibets.com/v1/events?sport=football
 *
 * If the endpoint changes:
 *   1. Open odibets.com → DevTools → Network → filter "XHR/Fetch"
 *   2. Navigate to Football
 *   3. Find the request returning a JSON list of games/events with odds
 *   4. Update URL_PATTERNS below
 *
 * ⚠️  Legal: Scraping may breach Odibets' ToS. Proceed only after legal review.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeOdibets = scrapeOdibets;
const normalize_1 = require("../lib/normalize");
const BOOKMAKER = 'Odibets';
/**
 * Substrings to match in Odibets' internal XHR URLs.
 * Checked in order — first match wins.
 */
const URL_PATTERNS = [
    'odibets.com/api/game',
    'odibets.com/api/events',
    'odibets.com/api/matches',
    'api.odibets.com',
    '/game/games',
    '/events?sport',
];
const API_TIMEOUT_MS = 20_000;
const TRACKED_SLUGS = [
    'arsenal-vs-chelsea',
    'man-city-vs-liverpool',
    'real-madrid-vs-barcelona',
    'man-united-vs-tottenham',
    'psg-vs-bayern-munich',
    'chelsea-vs-man-united',
    'liverpool-vs-arsenal',
];
/**
 * Parse a single game/event from Odibets' API response.
 *
 * Odibets API shapes seen in the wild:
 * {
 *   home: "Arsenal",
 *   away: "Chelsea",
 *   bet_outcomes: [
 *     { bet_type: "1", odd: 2.10 },
 *     { bet_type: "X", odd: 3.40 },
 *     { bet_type: "2", odd: 3.60 }
 *   ]
 * }
 *
 * OR flat:
 * { home_team: "Arsenal", away_team: "Chelsea", home_odd: 2.10, draw_odd: 3.40, away_odd: 3.60 }
 */
function parseMatch(match, scrapedAt) {
    try {
        const homeTeam = match.home ?? match.home_team ?? match.hometeam ?? match.HomeTeam ?? '';
        const awayTeam = match.away ?? match.away_team ?? match.awayteam ?? match.AwayTeam ?? '';
        if (!homeTeam || !awayTeam)
            return null;
        const matchSlug = (0, normalize_1.normalizeMatchSlug)(homeTeam, awayTeam);
        if (!TRACKED_SLUGS.includes(matchSlug ?? ''))
            return null;
        let homeOdds = 1.01;
        let drawOdds = 1.01;
        let awayOdds = 1.01;
        // Outcomes / bet_outcomes array
        const outcomes = match.bet_outcomes ??
            match.outcomes ??
            match.picks ??
            match.markets?.[0]?.outcomes ??
            [];
        if (outcomes.length >= 3) {
            const find = (key, idx) => {
                const byKey = outcomes.find((o) => (o.bet_type ?? o.odd_key ?? o.type ?? o.outcome_key ?? '')
                    .toString()
                    .toLowerCase() === key);
                return byKey ?? outcomes[idx];
            };
            homeOdds = (0, normalize_1.sanitizeOdds)(find('1', 0)?.odd ?? find('1', 0)?.odds ?? find('1', 0)?.price ?? 1.01);
            drawOdds = (0, normalize_1.sanitizeOdds)(find('x', 1)?.odd ?? find('x', 1)?.odds ?? find('x', 1)?.price ?? 1.01);
            awayOdds = (0, normalize_1.sanitizeOdds)(find('2', 2)?.odd ?? find('2', 2)?.odds ?? find('2', 2)?.price ?? 1.01);
        }
        else {
            // Flat odds on match object
            homeOdds = (0, normalize_1.sanitizeOdds)(match.home_odd ?? match.home_odds ?? match.odd1 ?? match.HomeOdds ?? 1.01);
            drawOdds = (0, normalize_1.sanitizeOdds)(match.draw_odd ?? match.draw_odds ?? match.oddX ?? match.DrawOdds ?? 1.01);
            awayOdds = (0, normalize_1.sanitizeOdds)(match.away_odd ?? match.away_odds ?? match.odd2 ?? match.AwayOdds ?? 1.01);
        }
        if (homeOdds === 1.01 && drawOdds === 1.01 && awayOdds === 1.01)
            return null;
        return {
            bookmaker: BOOKMAKER,
            matchSlug: matchSlug,
            homeTeam,
            awayTeam,
            homeOdds,
            drawOdds,
            awayOdds,
            scrapedAt,
        };
    }
    catch {
        return null;
    }
}
async function scrapeOdibets(page) {
    const results = [];
    const scrapedAt = new Date().toISOString();
    let capturedJson = null;
    // Register response listener before navigation
    page.on('response', async (response) => {
        if (capturedJson)
            return;
        const url = response.url();
        const matches = URL_PATTERNS.some((p) => url.includes(p));
        if (!matches)
            return;
        if (response.status() !== 200)
            return;
        const ct = response.headers()['content-type'] ?? '';
        if (!ct.includes('json') && !ct.includes('text'))
            return;
        try {
            const text = await response.text();
            if (!text.trim().startsWith('{') && !text.trim().startsWith('['))
                return;
            const json = JSON.parse(text);
            capturedJson = json;
        }
        catch { /* skip */ }
    });
    try {
        await page.goto('https://www.odibets.com/ke/sports/soccer', {
            waitUntil: 'domcontentloaded',
            timeout: 30_000,
        });
        // Wait for XHR
        const deadline = Date.now() + API_TIMEOUT_MS;
        while (!capturedJson && Date.now() < deadline) {
            await page.waitForTimeout(500);
        }
        if (!capturedJson) {
            console.warn(`[${BOOKMAKER}] No internal API response captured — site may have changed.`);
            return results;
        }
        const rawMatches = Array.isArray(capturedJson)
            ? capturedJson
            : capturedJson.data ??
                capturedJson.games ??
                capturedJson.events ??
                capturedJson.matches ??
                capturedJson.results ??
                [];
        for (const match of rawMatches) {
            const parsed = parseMatch(match, scrapedAt);
            if (parsed)
                results.push(parsed);
        }
        console.log(`[${BOOKMAKER}] Scraped ${results.length} matches at ${scrapedAt}`);
    }
    catch (err) {
        console.error(`[${BOOKMAKER}] Scrape failed: ${err.message}`);
        throw err;
    }
    return results;
}
