import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NextFunction, Request, Response } from 'express';
import * as request from 'supertest';
import { UserController } from 'src/api/user/controllers/user.controller';
import { UserService } from 'src/api/user/services/user.service';

jest.mock('src/api/auth/guards/auth.decorator', () => ({
  Auth: () => () => undefined,
}));
jest.mock('src/common/helper/serialize.interceptor', () => ({
  Serialize: () => () => undefined,
}));

describe('UserController (e2e)', () => {
  let app: INestApplication;
  const currentUser = {
    id: 7,
    email: 'testy@test.com',
  };
  const fakeUserService: Pick<UserService, 'findById'> = {
    findById: async (id: number) => {
      if (id !== currentUser.id) {
        throw new Error('Not found');
      }
      return {
        id,
        email: currentUser.email,
      } as never;
    },
  };

  type RequestWithUser = Request & { user: typeof currentUser };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use((req: RequestWithUser, _res: Response, next: NextFunction) => {
      req.user = currentUser;
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/user/profile (GET)', () => {
    it('should success', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/profile')
        .send();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: currentUser.id,
        email: currentUser.email,
      });
    });
  });
});
