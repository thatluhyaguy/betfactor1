"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveOddsSnapshot = saveOddsSnapshot;
exports.saveArbitrageOpportunity = saveArbitrageOpportunity;
exports.expireArbitrageOpportunity = expireArbitrageOpportunity;
exports.getActiveArbitrageFromDB = getActiveArbitrageFromDB;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function saveOddsSnapshot(odds) {
    try {
        await prisma.oddsSnapshot.create({
            data: {
                matchSlug: odds.matchSlug,
                bookmaker: odds.bookmaker,
                homeOdds: odds.homeOdds,
                drawOdds: odds.drawOdds,
                awayOdds: odds.awayOdds,
                scrapedAt: new Date(odds.scrapedAt),
            },
        });
    }
    catch (err) {
        console.error(`[Postgres] Failed to save odds snapshot for ${odds.matchSlug} (${odds.bookmaker}):`, err);
    }
}
async function saveArbitrageOpportunity(arb) {
    try {
        // Check if an unexpired record already exists for this match
        const existing = await prisma.arbitrageOpportunity.findFirst({
            where: {
                matchSlug: arb.matchSlug,
                expiredAt: null,
            },
        });
        if (existing) {
            // Update margin & prices
            await prisma.arbitrageOpportunity.update({
                where: { id: existing.id },
                data: {
                    margin: arb.margin,
                    bestHomeBookmaker: arb.bestHomeBookmaker,
                    bestHomeOdds: arb.bestHomeOdds,
                    bestDrawBookmaker: arb.bestDrawBookmaker,
                    bestDrawOdds: arb.bestDrawOdds,
                    bestAwayBookmaker: arb.bestAwayBookmaker,
                    bestAwayOdds: arb.bestAwayOdds,
                    detectedAt: new Date(),
                },
            });
        }
        else {
            await prisma.arbitrageOpportunity.create({
                data: {
                    matchSlug: arb.matchSlug,
                    margin: arb.margin,
                    bestHomeBookmaker: arb.bestHomeBookmaker,
                    bestHomeOdds: arb.bestHomeOdds,
                    bestDrawBookmaker: arb.bestDrawBookmaker,
                    bestDrawOdds: arb.bestDrawOdds,
                    bestAwayBookmaker: arb.bestAwayBookmaker,
                    bestAwayOdds: arb.bestAwayOdds,
                    detectedAt: new Date(),
                },
            });
        }
    }
    catch (err) {
        console.error(`[Postgres] Failed to save arbitrage opportunity for ${arb.matchSlug}:`, err);
    }
}
async function expireArbitrageOpportunity(matchSlug) {
    try {
        await prisma.arbitrageOpportunity.updateMany({
            where: {
                matchSlug,
                expiredAt: null,
            },
            data: {
                expiredAt: new Date(),
            },
        });
    }
    catch (err) {
        console.error(`[Postgres] Failed to expire arbitrage opportunity for ${matchSlug}:`, err);
    }
}
async function getActiveArbitrageFromDB() {
    try {
        return await prisma.arbitrageOpportunity.findMany({
            where: {
                expiredAt: null,
            },
            orderBy: {
                margin: 'desc',
            },
        });
    }
    catch (err) {
        console.error('[Postgres] Error querying active arbitrage from DB:', err);
        return [];
    }
}
