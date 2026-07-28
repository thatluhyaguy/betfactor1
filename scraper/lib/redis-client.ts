import { ScrapedMatchOdds } from './normalize';

// In-Memory Fallback Cache with TTL
const memoryStore = new Map<string, { data: string; expiresAt: number }>();

export class RedisService {
  private static instance: RedisService;
  private redisClient: any = null;

  private constructor() {
    if (process.env.REDIS_URL) {
      try {
        const Redis = require('ioredis');
        this.redisClient = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          tls: process.env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
        });
        this.redisClient.connect().catch((err: any) => {
          console.warn('[Redis] Connection failed, using in-memory store fallback:', err.message);
          this.redisClient = null;
        });
      } catch (err) {
        console.warn('[Redis] ioredis not available, using in-memory fallback.');
      }
    } else {
      console.warn('[Redis] No REDIS_URL set — using in-memory fallback (data lost on restart).');
    }
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  // ── Raw get/set ────────────────────────────────────────────────────────────

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (this.redisClient) {
      try {
        await this.redisClient.set(key, value, 'EX', ttlSeconds);
        return;
      } catch (err) {
        console.error('[Redis] set failed, using memory fallback:', err);
      }
    }
    memoryStore.set(key, { data: value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async get(key: string): Promise<string | null> {
    if (this.redisClient) {
      try {
        return await this.redisClient.get(key);
      } catch (err) {
        console.error('[Redis] get failed, falling back to memory:', err);
      }
    }
    const item = memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) { memoryStore.delete(key); return null; }
    return item.data;
  }

  async keys(pattern: string): Promise<string[]> {
    if (this.redisClient) {
      try {
        return await this.redisClient.keys(pattern);
      } catch (err) {
        console.error('[Redis] keys failed, falling back to memory:', err);
      }
    }
    // Memory fallback: simple prefix match
    const prefix = pattern.replace(/\*/g, '');
    return Array.from(memoryStore.keys()).filter(
      (k) => k.startsWith(prefix) && Date.now() <= (memoryStore.get(k)?.expiresAt ?? 0)
    );
  }

  // ── Match odds ─────────────────────────────────────────────────────────────

  /** Key: odds:{matchSlug}:{bookmaker} */
  async setMatchOdds(odds: ScrapedMatchOdds, ttlSeconds = 900): Promise<void> {
    const key = `odds:${odds.matchSlug}:${odds.bookmaker}`;
    await this.set(key, JSON.stringify(odds), ttlSeconds);
  }

  async getMatchOdds(matchSlug: string, bookmaker: string): Promise<ScrapedMatchOdds | null> {
    const raw = await this.get(`odds:${matchSlug}:${bookmaker}`);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  /**
   * Discover ALL unique match slugs currently in Redis.
   * Pattern: odds:*  → extract the slug part between first and last colon.
   */
  async getAllMatchSlugs(): Promise<string[]> {
    const allKeys = await this.keys('odds:*');
    const slugSet = new Set<string>();
    for (const key of allKeys) {
      // key format: odds:{matchSlug}:{bookmaker}
      const parts = key.split(':');
      if (parts.length >= 3) {
        // slug can itself contain colons only if bookmaker name had one — unlikely
        // Safe: everything between index 1 and last is the slug
        const slug = parts.slice(1, parts.length - 1).join(':');
        if (slug) slugSet.add(slug);
      }
    }
    return Array.from(slugSet);
  }

  /** Get odds from all known bookmakers for a given match slug */
  async getAllOddsForMatch(matchSlug: string): Promise<ScrapedMatchOdds[]> {
    const bookmakers = ['SportPesa', 'Betika', 'Odibets', 'Mozzart', 'SportyBet', '1xBet'];
    const results: ScrapedMatchOdds[] = [];
    for (const b of bookmakers) {
      const odds = await this.getMatchOdds(matchSlug, b);
      if (odds) results.push(odds);
    }
    return results;
  }

  // ── Arbitrage ──────────────────────────────────────────────────────────────

  async setActiveArbitrage(matchSlug: string, arbData: any, ttlSeconds = 900): Promise<void> {
    await this.set(`arb:active:${matchSlug}`, JSON.stringify(arbData), ttlSeconds);
  }

  async clearActiveArbitrage(matchSlug: string): Promise<void> {
    if (this.redisClient) {
      try { await this.redisClient.del(`arb:active:${matchSlug}`); } catch { }
    }
    memoryStore.delete(`arb:active:${matchSlug}`);
  }

  /** Return ALL currently active arb opportunities by scanning arb:active:* keys */
  async getActiveArbitrages(): Promise<any[]> {
    const allKeys = await this.keys('arb:active:*');
    const results: any[] = [];
    for (const key of allKeys) {
      const raw = await this.get(key);
      if (raw) {
        try { results.push(JSON.parse(raw)); } catch { }
      }
    }
    return results;
  }
}

export const redisService = RedisService.getInstance();
