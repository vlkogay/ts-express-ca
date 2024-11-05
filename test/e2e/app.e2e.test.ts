import request from 'supertest';
import start from '../../src/app'; // Adjust the path to your Express app
import getConfig from '../../src/config/config';
import { Express } from 'express';
import ICacheRepository from '../../src/application/repositories/cacheRepository';
const config = getConfig();
config.admin = config.e2e.admin; // Use e2e admin for tests
config.email = config.e2e.email; // Use e2e email for tests
config.postgres = config.e2e.postgres;
config.logger.level = 'error'; // Set log level to error
let app: Express;
let cache: ICacheRepository;

beforeAll(async () => {
  console.log('Starting server');
  const { webServer, cacheRepository } = await start(config);
  app = webServer.app;
  cache = cacheRepository;
  if (config.postgres.database !== config.e2e.postgres.database)
    throw new Error('Tests must use test database');
  console.log('Server started');
});

async function signIn(email: string, password: string): Promise<string> {
  const res = await request(app).post('/api/auth/signin').send({
    email,
    password,
  });
  return res.body.token;
}

describe('User Endpoints', () => {
  it('should admin signin', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      email: config.e2e.admin.email,
      password: config.e2e.admin.password,
    });
    expect(res.body).toHaveProperty('token');
    expect(res.statusCode).toEqual(201);
  });
  it('should recieve error 401 when create user without token', async () => {
    const res = await request(app).post('/api/users').send({
      name: 'testuser1',
      email: 'test1@test.com',
      password: 'testPassword1@',
    });
    expect(res.body).toHaveProperty('error', 'No access token found');
    expect(res.statusCode).toEqual(401);
  });

  it('should admin create user', async () => {
    const token = await signIn(
      config.e2e.admin.email,
      config.e2e.admin.password,
    );
    await request(app)
      .delete('/api/users/email/test1@test.com')
      .set('Authorization', `Bearer ${token}`);
    const res = await request(app)
      .post('/api/users')
      .send({
        name: 'testuser1',
        email: 'test1@test.com',
        password: 'testPassword1@',
      })
      .set('Authorization', `Bearer ${token}`);
    expect(res.body).toHaveProperty('id');
    expect(res.statusCode).toEqual(201);
  });

  it('should reset password', async () => {
    let res = await request(app).post('/api/users/reset-password').send({
      password: config.e2e.admin.password,
      email: config.e2e.admin.email,
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('email', config.e2e.admin.email);
    expect(res.body).toHaveProperty(
      'message',
      'The token was sent to the email',
    );

    const email = res.body.email;
    const resetPasswordToken = await cache.get('reset-password:' + email);
    res = await request(app).post('/api/users/reset-password').send({
      password: config.e2e.admin.password,
      email: config.e2e.admin.email,
      token: resetPasswordToken,
    });
    expect(res.body).toHaveProperty('message', 'The password has been changed');
    expect(res.statusCode).toEqual(201);
  });

  it('should not reset password with invalid token', async () => {
    const res = await request(app).post('/api/users/reset-password').send({
      password: config.e2e.admin.password,
      email: config.e2e.admin.email,
      token: 'invalid-token',
    });
    expect(res.statusCode).toEqual(401);
  });
});
