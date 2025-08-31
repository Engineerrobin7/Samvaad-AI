import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Redis client configuration
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined,
});

// Connect to Redis
(async () => {
  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
  }
})();

export default redisClient;