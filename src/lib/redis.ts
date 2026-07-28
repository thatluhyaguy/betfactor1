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
        const url = process.env.REDIS_URL;
        const isTLS = url.startsWith('rediss://');

        this.client = new Redis(url, {
          lazyConnect: true,
          connectTimeout: 2000,
          commandTimeout: 1500,
          maxRetriesPerRequest: 1,
          enableReadyCheck: false,
          retryStrategy(times: number) {
            return Math.min(times * 100, 1500);
          },
          tls: isTLS ? { rejectUnauthorized: false } : undefined,
        });

        this.client.connect().catch(() => { /* handled by error event */ });

        this.client.on('error', (err: any) => {
          const msg = err.message ?? '';
          if (!msg.includes('ECONNRESET') && !msg.includes('ETIMEDOUT') && !msg.includes('EPIPE') && !msg.includes('command option timeout')) {
            console.warn('[Redis Frontend] Client error:', msg);
          }
        });
      } catch (err: any) {
        console.warn('[Redis Frontend] ioredis not available — using in-memory fallback:', err.message);
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
