import redisClient, { connectRedis } from './config/redis';

const startServer = async () => {
  await connectRedis();
  // Your server logic here
};

startServer();