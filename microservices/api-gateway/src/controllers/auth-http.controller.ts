import { Body, Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { AuthGatewayService } from '../services/auth-gateway.service';

@Controller('auth')
export class AuthHttpController {
  constructor(private readonly authService: AuthGatewayService) {}

  @Post('register')
  register(@Body() payload: RegisterDto): Promise<{ message: string }> {
    return this.authService.register(payload);
  }

  @Post('login')
  login(@Body() payload: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(payload);
  }

  @Get('profile')
  async profile(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ id: string; email: string }> {
    const accessToken = authorization?.replace('Bearer ', '');
    if (!accessToken) {
      throw new UnauthorizedException('Missing bearer token');
    }
    return this.authService.profile(accessToken);
  }
}
