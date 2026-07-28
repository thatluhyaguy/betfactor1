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
        const url = process.env.REDIS_URL;

        // Upstash and other TLS Redis servers use rediss:// scheme
        const isTLS = url.startsWith('rediss://');

        this.redisClient = new Redis(url, {
          // DO NOT use lazyConnect — it breaks Upstash TLS handshake
          maxRetriesPerRequest: null, // null = keep retrying indefinitely on each command
          enableReadyCheck: false,    // required for Upstash
          retryStrategy(times: number) {
            // Back off: 200ms, 400ms ... max 5s
            return Math.min(times * 200, 5000);
          },
          tls: isTLS ? { rejectUnauthorized: false } : undefined,
        });

        this.redisClient.on('connect', () => {
          console.log('[Redis] Connected successfully.');
        });

        this.redisClient.on('ready', () => {
          console.log('[Redis] Client ready.');
        });

        this.redisClient.on('error', (err: any) => {
          // Log but don't crash — in-memory fallback is active
          if (!err.message?.includes('ECONNRESET') && !err.message?.includes('ETIMEDOUT')) {
            console.warn('[Redis] Error:', err.message);
          }
        });

      } catch (err: any) {
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

  private isConnected(): boolean {
    return this.redisClient && this.redisClient.status === 'ready';
  }

  // ── Raw get/set ────────────────────────────────────────────────────────────

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (this.isConnected()) {
      try {
        await this.redisClient.set(key, value, 'EX', ttlSeconds);
        return;
      } catch (err) {
        // Fallback to memory
      }
    }
    memoryStore.set(key, { data: value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected()) {
      try {
        return await this.redisClient.get(key);
      } catch (err) {
        // Fallback to memory
      }
    }
    const item = memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) { memoryStore.delete(key); return null; }
    return item.data;
  }

  async keys(pattern: string): Promise<string[]> {
    if (this.isConnected()) {
      try {
        return await this.redisClient.keys(pattern);
      } catch (err) {
        // Fallback to memory
      }
    }
    const prefix = pattern.replace(/\*/g, '');
    return Array.from(memoryStore.keys()).filter(
      (k) => k.startsWith(prefix) && Date.now() <= (memoryStore.get(k)?.expiresAt ?? 0)
    );
  }

  async del(key: string): Promise<void> {
    if (this.isConnected()) {
      try { await this.redisClient.del(key); return; } catch { }
    }
    memoryStore.delete(key);
  }

  // ── Match odds ─────────────────────────────────────────────────────────────

  async setMatchOdds(odds: ScrapedMatchOdds, ttlSeconds = 900): Promise<void> {
    const key = `odds:${odds.matchSlug}:${odds.bookmaker}`;
    await this.set(key, JSON.stringify(odds), ttlSeconds);
  }

  async getMatchOdds(matchSlug: string, bookmaker: string): Promise<ScrapedMatchOdds | null> {
    const raw = await this.get(`odds:${matchSlug}:${bookmaker}`);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  async getAllMatchSlugs(): Promise<string[]> {
    const allKeys = await this.keys('odds:*');
    const slugSet = new Set<string>();
    for (const key of allKeys) {
      const parts = key.split(':');
      if (parts.length >= 3) {
        const slug = parts.slice(1, parts.length - 1).join(':');
        if (slug) slugSet.add(slug);
      }
    }
    return Array.from(slugSet);
  }

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
    await this.del(`arb:active:${matchSlug}`);
  }

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
