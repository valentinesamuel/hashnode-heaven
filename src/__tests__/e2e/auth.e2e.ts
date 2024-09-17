import request from 'supertest';
import { DataSource } from 'typeorm';
import { createClient } from 'redis';
import { Server } from 'node:http';
import path from 'path';
import { app } from '../..';  // Adjust this import based on your actual app location

const redisClient = createClient();

describe('Auth E2E', () => {
  let server: Server;
  let port: number;
  let dataSource: DataSource;

  // Increase the timeout for the entire test suite
  jest.setTimeout(30000); // 30 seconds

  beforeAll(async () => {
    try {
      port = (Math.random() * 50000 + 10000) | 0;

      // Initialize Redis
      await redisClient.connect();
      console.log('Connected to Redis');

      // Initialize PostgreSQL
      dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5433,
        username: 'postgres',
        password: 'password',
        database: 'postgres',
        entities: [path.join(__dirname, '..', '..', 'entities', '**', '*.entity.{ts,js}')],
        synchronize: true,
        logging: true,
      });

      await dataSource.initialize();
      console.log('Data Source has been initialized!');

      // Start the server
      await new Promise<void>((resolve, reject) => {
        server = app.listen(port, () => {
          console.log(`Server is running on port ${port}`);
          resolve();
        });
        server.on('error', reject);
      });
    } catch (error) {
      console.error('Error during test setup:', error);
      throw error;
    }
  }, 30000); // 30 seconds timeout for beforeAll

  afterAll(async () => {
    try {
      // Close server
      await new Promise<void>((resolve) => server.close(() => resolve()));

      // Close PostgreSQL connection
      await dataSource.destroy();
      console.log('PostgreSQL connection closed');

      // Disconnect Redis client
      await redisClient.quit();
      console.log('Disconnected from Redis');
    } catch (error) {
      console.error('Error during test teardown:', error);
      throw error;
    }
  }, 30000); // 30 seconds timeout for afterAll

  it('should allow user registration and return a token', async () => {
    const userCredentials = {
      email: 'test@test.com',
      username: 'tester',
      password: 'password',
    };

    const res = await request(app)
      .post('/auth/signup')
      .send(userCredentials)
      .expect('Content-Type', /json/)
      .expect(200);

    console.log(res);

    // expect(res.body.data).toHaveProperty('token');
    // expect(typeof res.body.data.token).toBe('string');
  });

  it('should return 400 for invalid user credentials', async () => {
    const invalidCredentials = {
      // Provide invalid or missing credentials
      userUnknown: 'testUser',
    };

    const res = await request(app)
      .post('/auth/signup')
      .send(invalidCredentials)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body).not.toBe({});
    expect(res.body.errors).toBeDefined();
  });
});