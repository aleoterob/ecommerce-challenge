import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthController } from 'src/api/auth/controllers/auth.controller';
import { AuthService } from 'src/api/auth/services/auth.service';

const userPasswords = new Map<string, string>();

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const validUser = {
    email: 'test1s@test.com',
    password: '12345678',
  };
  const fakeAuthService: Pick<AuthService, 'register' | 'login'> = {
    register: async (user) => {
      if (userPasswords.has(user.email)) {
        throw new Error('User already exists');
      }
      userPasswords.set(user.email, user.password);
      return { message: 'success' };
    },
    login: async (user) => {
      const savedPassword = userPasswords.get(user.email);
      if (!savedPassword || savedPassword !== user.password) {
        throw new Error('Wrong credentials');
      }
      return { accessToken: 'test-token' };
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    userPasswords.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should success', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser);
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'success' });
    });

    it('should fail if already registered', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(validUser);
      const duplicateResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser);
      expect(duplicateResponse.status).toBe(500);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should success', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(validUser);
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(validUser);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should fail if wrong password', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(validUser);
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          ...validUser,
          password: 'wrong password',
        });
      expect(response.status).toBe(500);
    });

    it('should fail if wrong email', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(validUser);
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          ...validUser,
          email: 'wrong@test.com',
        });
      expect(response.status).toBe(500);
    });
  });
});
