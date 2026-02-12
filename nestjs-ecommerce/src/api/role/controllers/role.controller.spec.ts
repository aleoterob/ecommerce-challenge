import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { Role } from '../../../database/entities/role.entity';
import { RoleIds, Roles } from '../enum/role.enum';
import { RoleService } from '../services/role.service';
import { UserService } from 'src/api/user/services/user.service';

jest.mock('src/api/auth/guards/auth.decorator', () => ({
  Auth: () => () => undefined,
}));

describe('RoleController', () => {
  let controller: RoleController;
  let fakeRoleService: Partial<RoleService>;
  let fakeUserService: Partial<UserService>;

  const customerRole = {
    id: RoleIds.Customer,
    name: Roles.Customer,
  } as Role;

  beforeEach(async () => {
    fakeRoleService = {
      findById: () => {
        return Promise.resolve(customerRole);
      },
    };
    fakeUserService = {};
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: fakeRoleService,
        },
        {
          provide: UserService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
