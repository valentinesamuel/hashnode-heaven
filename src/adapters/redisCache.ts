import redisClient from '../config/redis';

export class RedisCacheService {
  async get(key: string) {
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async set(key: string, value: any) {
    try {
      await redisClient.set(key, value);
      await redisClient.expire(key, 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error(error);
    }
  }

  async has(key: string) {
    try {
      return await redisClient.exists(key);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async delete(key: string) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error(error);
    }
  }
}
