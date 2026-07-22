import redis from '../../../shared/redis/redis.js';

const Limits = {
  chat: 20,
  coding: 5,
  pdf: 5,
  ppt: 5,
  image: 3,
  search: 5,
};

export const checkLimit = async (userId, agent) => {
  const max = Limits[agent] ?? Limits.chat;
  const key = `rate:${agent}:${userId}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);

  const ttl = await redis.ttl(key);
  if (count > max) {
    const minutes = Math.floor(ttl / 60);
    const seconds = ttl % 60;
    const time = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    const error = new Error(`Rate limit exceeded for ${agent}.`);
    error.status = 429;

    error.data = {
      success: false,
      agent,
      limit: max,
      remainingTime: ttl,
      retryAfter: time,
      message: `You have reached the ${agent} limit (${max} requests/minute). Try again in ${time}.`,
    };
    throw error;
  }
  return {
    remaining: max - count,
    limit: max,
  };
};
