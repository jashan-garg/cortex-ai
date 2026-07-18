// clear-session.js — run once with `node clear-session.js`
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redis = new Redis(process.env.REDIS_URL);

const keys = await redis.keys('session-*');
console.log('Found sessions:', keys);

for (const key of keys) await redis.del(key);

console.log('Cleared all sessions');
process.exit(0);
