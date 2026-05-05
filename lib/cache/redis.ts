import { Redis } from "@upstash/redis"

export const TTL_CONCERTS = 6 * 60 * 60
export const TTL_STEAM = 24 * 60 * 60

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  Redis.fromEnv()

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get<T>(key)
    return value ?? null
  } catch (e) {
    console.error("[redis] getCached failed", { key, error: e })
    return null
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttlSeconds })
  } catch (e) {
    console.error("[redis] setCached failed", { key, error: e })
  }
}

export async function invalidateConcertCache(): Promise<void> {
  try {
    const keys = await redis.keys("concerts:*")
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (e) {
    console.error("[redis] invalidateConcertCache failed", { error: e })
  }
}
