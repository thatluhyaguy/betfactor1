"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = exports.RedisService = void 0;
// In-Memory Fallback Cache with TTL for resilience when Redis server is offline
const memoryStore = new Map();
class RedisService {
    static instance;
    redisClient = null;
    constructor() {
        // Attempt lazy load of ioredis if REDIS_URL is provided in environment
        if (process.env.REDIS_URL) {
            try {
                const Redis = require('ioredis');
                this.redisClient = new Redis(process.env.REDIS_URL, {
                    maxRetriesPerRequest: 1,
                    lazyConnect: true,
                });
                this.redisClient.connect().catch((err) => {
                    console.warn('[Redis] Connection failed, using in-memory store fallback:', err.message);
                    this.redisClient = null;
                });
            }
            catch (err) {
                console.warn('[Redis] ioredis package not found or failed, using in-memory fallback.');
            }
        }
    }
    static getInstance() {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }
    /**
     * Key pattern: odds:{match_slug}:{bookmaker}
     */
    async setMatchOdds(odds, ttlSeconds = 900) {
        const key = `odds:${odds.matchSlug}:${odds.bookmaker}`;
        const payload = JSON.stringify(odds);
        if (this.redisClient) {
            try {
                await this.redisClient.set(key, payload, 'EX', ttlSeconds);
                return;
            }
            catch (err) {
                console.error('[Redis] Failed to set key, using memory store fallback:', err);
            }
        }
        // Memory store fallback
        memoryStore.set(key, {
            data: payload,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }
    async getMatchOdds(matchSlug, bookmaker) {
        const key = `odds:${matchSlug}:${bookmaker}`;
        if (this.redisClient) {
            try {
                const val = await this.redisClient.get(key);
                if (val)
                    return JSON.parse(val);
            }
            catch (err) {
                console.error('[Redis] Failed to get key, falling back to memory store:', err);
            }
        }
        const item = memoryStore.get(key);
        if (item) {
            if (Date.now() > item.expiresAt) {
                memoryStore.delete(key);
                return null;
            }
            return JSON.parse(item.data);
        }
        return null;
    }
    async getAllOddsForMatch(matchSlug) {
        const bookmakers = ['SportPesa', 'Betika', 'Odibets', 'Mozzart', 'SportyBet', '1xBet'];
        const results = [];
        for (const b of bookmakers) {
            const odds = await this.getMatchOdds(matchSlug, b);
            if (odds) {
                results.push(odds);
            }
        }
        return results;
    }
    async setActiveArbitrage(matchSlug, arbData, ttlSeconds = 900) {
        const key = `arb:active:${matchSlug}`;
        const payload = JSON.stringify(arbData);
        if (this.redisClient) {
            try {
                await this.redisClient.set(key, payload, 'EX', ttlSeconds);
                return;
            }
            catch (err) {
                // Fallback
            }
        }
        memoryStore.set(key, { data: payload, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
    async clearActiveArbitrage(matchSlug) {
        const key = `arb:active:${matchSlug}`;
        if (this.redisClient) {
            try {
                await this.redisClient.del(key);
            }
            catch (err) { }
        }
        memoryStore.delete(key);
    }
    async getActiveArbitrages() {
        const canonicalSlugs = [
            'arsenal-vs-chelsea',
            'man-city-vs-liverpool',
            'real-madrid-vs-barcelona',
            'man-united-vs-tottenham',
            'psg-vs-bayern-munich',
            'chelsea-vs-man-united',
            'liverpool-vs-arsenal',
        ];
        const activeArbs = [];
        for (const slug of canonicalSlugs) {
            const key = `arb:active:${slug}`;
            let dataStr = null;
            if (this.redisClient) {
                try {
                    dataStr = await this.redisClient.get(key);
                }
                catch (err) { }
            }
            if (!dataStr) {
                const mem = memoryStore.get(key);
                if (mem && Date.now() <= mem.expiresAt) {
                    dataStr = mem.data;
                }
            }
            if (dataStr) {
                try {
                    activeArbs.push(JSON.parse(dataStr));
                }
                catch (e) { }
            }
        }
        return activeArbs;
    }
}
exports.RedisService = RedisService;
exports.redisService = RedisService.getInstance();
