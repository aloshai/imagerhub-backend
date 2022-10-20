import { Strategy, StrategyOptions } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Profile } from 'passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get('google.clientId'),
      clientSecret: configService.get('google.clientSecret'),
      callbackURL: configService.get('google.callbackUrl'),
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    return profile;
  }
}
