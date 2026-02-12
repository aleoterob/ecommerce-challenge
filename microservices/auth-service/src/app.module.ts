import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMessagesController } from './controllers/auth-messages.controller';
import { User } from './entities/user.entity';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url:
          configService.get<string>('AUTH_DATABASE_URL') ??
          configService.get<string>('DATABASE_URL'),
        entities: [User],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'dev-secret',
        signOptions: { expiresIn: '2h' },
      }),
    }),
  ],
  controllers: [AuthMessagesController],
  providers: [UsersService, AuthService],
})
export class AppModule {}
