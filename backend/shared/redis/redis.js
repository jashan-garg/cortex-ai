import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => {
  console.log('Redis connected');
});

export default redis;

// import dotenv from 'dotenv';
// dotenv.config({ path: '../../.env' });
// import { Redis } from '@upstash/redis';

// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN,
// });

// (async () => {
//   try {
//     const pong = await redis.ping();
//     console.log('Redis connected:', pong);
//   } catch (err) {
//     console.error('Redis connection failed:', err);
//   }
// })();

// export default redis;
