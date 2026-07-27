/**
 * Redis service for the Next.js server runtime.
 *
 * Shared between API routes. Uses ioredis when REDIS_URL is set,
 * falls back to an in-memory Map with TTL so the app works locally
 * without a Redis instance.
 */

// In-memory fallback store
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
      try {
        return await this.client.get(key);
      } catch { /* fall through */ }
    }
    const item = memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) { memoryStore.delete(key); return null; }
    return item.data;
  }

  async keys(pattern: string): Promise<string[]> {
    if (this.client) {
      try {
        return await this.client.keys(pattern);
      } catch { /* fall through */ }
    }
    // In-memory fallback: simple prefix/glob match
    const prefix = pattern.replace('*', '');
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

  async getActiveArbitrages(): Promise<any[]> {
    const slugs = [
      'arsenal-vs-chelsea', 'man-city-vs-liverpool', 'real-madrid-vs-barcelona',
      'man-united-vs-tottenham', 'psg-vs-bayern-munich', 'chelsea-vs-man-united',
      'liverpool-vs-arsenal',
    ];
    const results: any[] = [];
    for (const slug of slugs) {
      const raw = await this.get(`arb:active:${slug}`);
      if (raw) {
        try { results.push(JSON.parse(raw)); } catch { /* skip */ }
      }
    }
    return results;
  }
}

export const redisService = RedisService.getInstance();
