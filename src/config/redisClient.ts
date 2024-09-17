import { createClient } from 'redis';

const client = createClient();

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => console.error('Redis error:', err));

export default client;
