import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get("jwt.expiresIn") },
      }),
      inject: [ConfigService]
    })
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule { }
