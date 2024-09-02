import request from 'supertest';
import { app } from '../..';
import { createClient } from 'redis';

const client = createClient();

describe('Auth E2E', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let server: any;
  let port: number;

  beforeAll(async () => {
    client.on('error', (err) => console.error('Redis error:', err));

    port = (Math.random() * 50000 + 10000) | 0;
    client.connect();
    server = app.listen(port);
  });

  afterAll(async () => {
    await client.quit();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('should allow user registration and return a token', async () => {
    const userCredentials = {
      userId: 'testUser',
    };

    const res = await request(app)
      .post('/login')
      .send(userCredentials)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
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
