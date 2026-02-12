import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AuthMessagesController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(
    @Payload() payload: RegisterUserDto,
    @Ctx() context: RmqContext,
  ): Promise<{ message: string }> {
    this.ack(context);
    return this.authService.register(payload);
  }

  @MessagePattern('auth.login')
  async login(
    @Payload() payload: LoginUserDto,
    @Ctx() context: RmqContext,
  ): Promise<{ accessToken: string }> {
    this.ack(context);
    return this.authService.login(payload);
  }

  @MessagePattern('auth.profile')
  async profile(
    @Payload() payload: { accessToken: string },
    @Ctx() context: RmqContext,
  ): Promise<{ id: string; email: string }> {
    this.ack(context);
    return this.authService.profile(payload.accessToken);
  }

  private ack(context: RmqContext): void {
    const channel = context.getChannelRef() as { ack: (msg: unknown) => void };
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
