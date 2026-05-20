import { Redis } from "@upstash/redis";

export type UpstashRedis = Redis;

export function getUpstashRedis(): UpstashRedis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token || !url.startsWith("https://")) {
    return null;
  }

  process.env.UPSTASH_REDIS_REST_URL = url;
  process.env.UPSTASH_REDIS_REST_TOKEN = token;

  try {
    return Redis.fromEnv();
  } catch {
    return null;
  }
}
