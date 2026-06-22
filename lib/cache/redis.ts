import { Redis } from "@upstash/redis"

export const TTL_CONCERTS = 6 * 60 * 60
export const TTL_STEAM = 24 * 60 * 60

const REDIS_TIMEOUT_MS = 2_000

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

function getRedis(): Redis {
  if (globalForRedis.redis) return globalForRedis.redis

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    throw new Error(
      "[redis] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required"
    )
  }

  const client = new Redis({ url, token })

  if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = client
  }

  return client
}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Redis timeout after ${REDIS_TIMEOUT_MS}ms`)),
        REDIS_TIMEOUT_MS
      )
    ),
  ])
}

export { getRedis as redis }

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const value = await withTimeout(getRedis().get<T>(key))
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
    await withTimeout(getRedis().set(key, value, { ex: ttlSeconds }))
  } catch (e) {
    console.error("[redis] setCached failed", { key, error: e })
  }
}

export async function invalidateConcertCache(): Promise<void> {
  try {
    const keys = await withTimeout(getRedis().keys("concerts:*"))
    if (keys.length > 0) {
      await withTimeout(getRedis().del(...keys))
    }
  } catch (e) {
    console.error("[redis] invalidateConcertCache failed", { error: e })
  }
}
