import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Provider } from '@apps/app/enums/provider.enum';
import { UserDocument } from '@libs/common/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser({
    email,
    provider,
    password,
  }: {
    email: string;
    provider: Provider;
    password?: string;
  }): Promise<UserDocument | null> {
    const user = await this.usersService.findOne(email, provider, password);
    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
    };
  }
}
