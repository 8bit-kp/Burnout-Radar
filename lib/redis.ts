import { Redis } from '@upstash/redis';

// Create Redis client (singleton pattern)
let redisClient: Redis | null = null;

export function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  try {
    // Use Upstash REST API (works in serverless environments)
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.warn('⚠️  Upstash credentials not found, running without cache');
      console.warn('Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local');
      return null;
    }

    redisClient = new Redis({
      url,
      token,
    });

    console.log('✓ Upstash Redis configured');
    return redisClient;
  } catch (error) {
    console.warn('Redis unavailable, continuing without cache:', error);
    redisClient = null;
    return null;
  }
}

// Cache helper with error handling and timeout
export async function cacheGet(key: string): Promise<string | null> {
  try {
    const client = getRedisClient();
    if (!client) return null;
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 5000); // 5 second timeout
    });
    
    const value = await Promise.race([
      client.get(key),
      timeoutPromise
    ]);
    
    return typeof value === 'string' ? value : JSON.stringify(value);
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
}

export async function cacheSet(key: string, value: string, expirySeconds: number = 300): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 5000); // 5 second timeout
    });
    
    await Promise.race([
      client.setex(key, expirySeconds, value),
      timeoutPromise
    ]);
  } catch (error) {
    console.warn('Cache write error:', error);
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 5000); // 5 second timeout
    });
    
    await Promise.race([
      client.del(key),
      timeoutPromise
    ]);
  } catch (error) {
    console.warn('Cache delete error:', error);
  }
}

// Pattern-based cache invalidation (e.g., clear all user journals)
export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    console.warn('Cache pattern delete error:', error);
  }
}
