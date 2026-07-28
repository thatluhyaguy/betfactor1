"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = exports.RedisService = void 0;
// In-Memory Fallback Cache with TTL
const memoryStore = new Map();
class RedisService {
    static instance;
    redisClient = null;
    constructor() {
        if (process.env.REDIS_URL) {
            try {
                const Redis = require('ioredis');
                this.redisClient = new Redis(process.env.REDIS_URL, {
                    maxRetriesPerRequest: 3,
                    retryStrategy(times) {
                        return Math.min(times * 100, 3000);
                    },
                    lazyConnect: true,
                    tls: process.env.REDIS_URL.startsWith('rediss://')
                        ? { rejectUnauthorized: false }
                        : undefined,
                });
                // Suppress unhandled ioredis error events from crashing node process
                this.redisClient.on('error', (err) => {
                    console.warn('[Redis] Client error (reconnecting):', err.message);
                });
                this.redisClient.connect().catch((err) => {
                    console.warn('[Redis] Connection initial handshake failed, fallback active:', err.message);
                });
            }
            catch (err) {
                console.warn('[Redis] ioredis not available, using in-memory fallback.');
            }
        }
        else {
            console.warn('[Redis] No REDIS_URL set — using in-memory fallback (data lost on restart).');
        }
    }
    static getInstance() {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }
    // ── Raw get/set ────────────────────────────────────────────────────────────
    async set(key, value, ttlSeconds) {
        if (this.redisClient) {
            try {
                await this.redisClient.set(key, value, 'EX', ttlSeconds);
                return;
            }
            catch (err) {
                // Fallback to memory
            }
        }
        memoryStore.set(key, { data: value, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
    async get(key) {
        if (this.redisClient) {
            try {
                return await this.redisClient.get(key);
            }
            catch (err) {
                // Fallback to memory
            }
        }
        const item = memoryStore.get(key);
        if (!item)
            return null;
        if (Date.now() > item.expiresAt) {
            memoryStore.delete(key);
            return null;
        }
        return item.data;
    }
    async keys(pattern) {
        if (this.redisClient) {
            try {
                return await this.redisClient.keys(pattern);
            }
            catch (err) {
                // Fallback to memory
            }
        }
        const prefix = pattern.replace(/\*/g, '');
        return Array.from(memoryStore.keys()).filter((k) => k.startsWith(prefix) && Date.now() <= (memoryStore.get(k)?.expiresAt ?? 0));
    }
    // ── Match odds ─────────────────────────────────────────────────────────────
    async setMatchOdds(odds, ttlSeconds = 900) {
        const key = `odds:${odds.matchSlug}:${odds.bookmaker}`;
        await this.set(key, JSON.stringify(odds), ttlSeconds);
    }
    async getMatchOdds(matchSlug, bookmaker) {
        const raw = await this.get(`odds:${matchSlug}:${bookmaker}`);
        if (!raw)
            return null;
        try {
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
    async getAllMatchSlugs() {
        const allKeys = await this.keys('odds:*');
        const slugSet = new Set();
        for (const key of allKeys) {
            const parts = key.split(':');
            if (parts.length >= 3) {
                const slug = parts.slice(1, parts.length - 1).join(':');
                if (slug)
                    slugSet.add(slug);
            }
        }
        return Array.from(slugSet);
    }
    async getAllOddsForMatch(matchSlug) {
        const bookmakers = ['SportPesa', 'Betika', 'Odibets', 'Mozzart', 'SportyBet', '1xBet'];
        const results = [];
        for (const b of bookmakers) {
            const odds = await this.getMatchOdds(matchSlug, b);
            if (odds)
                results.push(odds);
        }
        return results;
    }
    // ── Arbitrage ──────────────────────────────────────────────────────────────
    async setActiveArbitrage(matchSlug, arbData, ttlSeconds = 900) {
        await this.set(`arb:active:${matchSlug}`, JSON.stringify(arbData), ttlSeconds);
    }
    async clearActiveArbitrage(matchSlug) {
        if (this.redisClient) {
            try {
                await this.redisClient.del(`arb:active:${matchSlug}`);
            }
            catch { }
        }
        memoryStore.delete(`arb:active:${matchSlug}`);
    }
    async getActiveArbitrages() {
        const allKeys = await this.keys('arb:active:*');
        const results = [];
        for (const key of allKeys) {
            const raw = await this.get(key);
            if (raw) {
                try {
                    results.push(JSON.parse(raw));
                }
                catch { }
            }
        }
        return results;
    }
}
exports.RedisService = RedisService;
exports.redisService = RedisService.getInstance();
