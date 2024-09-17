import request from 'supertest';
import { app } from '../..';
import { createClient } from 'redis';
import { TestDataSource } from '../../ormconfig';
import { Server } from 'node:http';

const redisClient = createClient();

describe('Auth E2E', () => {
  let server: Server;
  let port: number;

  beforeAll(async () => {
    port = (Math.random() * 50000 + 10000) | 0;

    // Start the server
    server = app.listen(port, async () => {
      // Initialize Redis
      await redisClient.connect();
      console.log('Connected to Redis');

      // Initialize PostgresSQL
      await TestDataSource.initialize();
      console.log('Data Source has been initialized!');
      console.debug(`Server is running on port ${port}`);
    });
  });

  afterAll(async () => {
    // Close server
    await new Promise<void>((resolve) => server.close(() => resolve()));

    // Close PostgresSQL connection
    await TestDataSource.destroy();
    console.log('PostgresSQL connection closed');

    // Disconnect Redis client
    await redisClient.quit();
    console.log('Disconnected from Redis');
  });

  it('should allow user registration and return a token', async () => {
    const userCredentials = {
      userId: '23455',
    };

    const res = await request(app)
      .post('/login')
      .send(userCredentials)
      .expect('Content-Type', /json/)
      .expect(200);

    console.log(res);

    expect(res.body.data).toHaveProperty('token');
    expect(typeof res.body.data.token).toBe('string');
  });

  it('should return 400 for invalid user credentials', async () => {
    const invalidCredentials = {
      // Provide invalid or missing credentials
      userUnknown: 'testUser',
    };

    const res = await request(app)
      .post('/login')
      .send(invalidCredentials)
      .expect('Content-Type', /json/)
      .expect(400); // Expect the status code for invalid input

    // Check that the response contains an error message
    expect(res.body).not.toBe({});
    expect(res.body).not.toBe({
      errors: [
        'Expected string but got undefined on userId',
        'Unrecognized key(s) in: [ userUnknown ]',
      ],
      status: 'error',
    });
    expect(res.body.errors).toBeDefined();
  });
});
