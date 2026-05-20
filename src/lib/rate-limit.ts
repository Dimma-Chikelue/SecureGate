// Simple in-memory storage for rate limiting (fallback for local development)
const ipCache = new Map<string, { attempts: number; resetTime: number }>();

async function checkUpstashLimit(ip: string, limit: number, durationMs: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) return null;

  try {
    const key = `ratelimit:${ip}`;
    
    // We can call Upstash REST API directly to keep it simple and dependency-free
    const getRes = await fetch(`${url}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await getRes.json();
    
    const attempts = data.result ? parseInt(data.result, 10) : 0;
    
    if (attempts >= limit) {
      const ttlRes = await fetch(`${url}/ttl/${key}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ttlData = await ttlRes.json();
      const remainingSeconds = ttlData.result || 60;
      return { success: false, remainingMs: remainingSeconds * 1000 };
    }

    // Pipeline to increment and set expiry in one call
    const pipeline = [
      ["INCR", key]
    ];
    if (attempts === 0) {
      pipeline.push(["EXPIRE", key, String(Math.ceil(durationMs / 1000))]);
    }

    await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(pipeline),
    });

    return { success: true, remainingMs: durationMs };
  } catch (error) {
    console.error("Upstash Redis error, falling back to local rate limiting:", error);
    return null;
  }
}

export const FORGOT_PASSWORD_RATE_LIMIT = { limit: 3, durationMinutes: 10 };
export const LOGIN_RATE_LIMIT = { limit: 5, durationMinutes: 10 };

export async function rateLimit(ip: string, limit: number, durationMinutes: number) {
  const durationMs = durationMinutes * 60 * 1000;
  
  // 1. Try Upstash Redis if configured
  const upstashResult = await checkUpstashLimit(ip, limit, durationMs);
  if (upstashResult !== null) {
    return upstashResult;
  }

  // 2. Fallback to robust In-Memory rate limiting
  const now = Date.now();
  const cachedData = ipCache.get(ip);

  if (!cachedData || now > cachedData.resetTime) {
    // Reset or initialize rate limit
    ipCache.set(ip, {
      attempts: 1,
      resetTime: now + durationMs,
    });
    return { success: true, remainingMs: durationMs };
  }

  if (cachedData.attempts >= limit) {
    return {
      success: false,
      remainingMs: Math.max(0, cachedData.resetTime - now),
    };
  }

  cachedData.attempts += 1;
  return {
    success: true,
    remainingMs: Math.max(0, cachedData.resetTime - now),
  };
}
