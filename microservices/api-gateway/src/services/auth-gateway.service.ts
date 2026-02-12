import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import {
  AUTH_LOGIN_PATTERN,
  AUTH_PROFILE_PATTERN,
  AUTH_REGISTER_PATTERN,
  AUTH_SERVICE_CLIENT,
} from '../messaging/rmq.constants';

@Injectable()
export class AuthGatewayService {
  constructor(
    @Inject(AUTH_SERVICE_CLIENT) private readonly authClient: ClientProxy,
  ) {}

  async register(payload: RegisterDto): Promise<{ message: string }> {
    return firstValueFrom(this.authClient.send(AUTH_REGISTER_PATTERN, payload));
  }

  async login(payload: LoginDto): Promise<{ accessToken: string }> {
    return firstValueFrom(this.authClient.send(AUTH_LOGIN_PATTERN, payload));
  }

  async profile(accessToken: string): Promise<{ id: string; email: string }> {
    return firstValueFrom(
      this.authClient.send(AUTH_PROFILE_PATTERN, { accessToken }),
    );
  }
}
