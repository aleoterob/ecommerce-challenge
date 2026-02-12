import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { User } from '../../../database/entities/user.entity';
import { UserService } from '../services/user.service';

jest.mock('src/api/auth/guards/auth.decorator', () => ({
  Auth: () => () => undefined,
}));
jest.mock('src/common/helper/serialize.interceptor', () => ({
  Serialize: () => () => undefined,
}));

describe('UserController', () => {
  let controller: UserController;
  let fakeUserService: Partial<UserService>;
  beforeEach(async () => {
    fakeUserService = {
      createUser: () => {
        return Promise.resolve({
          id: 1,
          email: 'testuser@example.com',
          password: 'password',
        } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
