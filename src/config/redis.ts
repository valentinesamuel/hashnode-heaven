import { createClient } from 'redis';
import { AppConfig } from './config';

const client = createClient({
  url: AppConfig.redisUrl,
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => console.error('Redis error:', err));

export default client;
