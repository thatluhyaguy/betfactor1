/**
 * Redis service for the Next.js server runtime.
 * Uses ioredis when REDIS_URL is set, falls back to in-memory Map with TTL.
 */

const memoryStore = new Map<string, { data: string; expiresAt: number }>();

class RedisService {
  private static instance: RedisService;
  private client: any = null;

  private constructor() {
    if (process.env.REDIS_URL) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Redis = require('ioredis');
        this.client = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          tls: process.env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
        });
        this.client.connect().catch(() => {
          console.warn('[Redis] Connection failed — using in-memory fallback');
          this.client = null;
        });
      } catch {
        console.warn('[Redis] ioredis not available — using in-memory fallback');
      }
    }
  }

  static getInstance(): RedisService {
    if (!RedisService.instance) RedisService.instance = new RedisService();
    return RedisService.instance;
  }

  async get(key: string): Promise<string | null> {
    if (this.client) {
      try { return await this.client.get(key); } catch { /* fall through */ }
    }
    const item = memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) { memoryStore.delete(key); return null; }
    return item.data;
  }

  async keys(pattern: string): Promise<string[]> {
    if (this.client) {
      try { return await this.client.keys(pattern); } catch { /* fall through */ }
    }
    const prefix = pattern.replace(/\*/g, '');
    return Array.from(memoryStore.keys()).filter((k) => k.startsWith(prefix));
  }

  async getAllOddsForMatch(matchSlug: string): Promise<any[]> {
    const bookmakers = ['SportPesa', 'Betika', 'Odibets', 'Mozzart', 'SportyBet', '1xBet'];
    const results: any[] = [];
    for (const b of bookmakers) {
      const raw = await this.get(`odds:${matchSlug}:${b}`);
      if (raw) {
        try { results.push(JSON.parse(raw)); } catch { /* skip malformed */ }
      }
    }
    return results;
  }

  /** Dynamically scan all arb:active:* keys — works for any match, not just a hardcoded list */
  async getActiveArbitrages(): Promise<any[]> {
    const allKeys = await this.keys('arb:active:*');
    const results: any[] = [];
    for (const key of allKeys) {
      const raw = await this.get(key);
      if (raw) {
        try { results.push(JSON.parse(raw)); } catch { /* skip */ }
      }
    }
    return results;
  }
}

export const redisService = RedisService.getInstance();
