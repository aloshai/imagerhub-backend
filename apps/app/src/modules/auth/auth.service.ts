import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Provider } from '../../enums/provider.enum';
import { UserDocument } from '../../schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) { }

    async validateUser({ email, provider, password }: { email: string, provider: Provider, password?: string }): Promise<UserDocument | null> {
        const user = await this.usersService.findOne(email, provider, password);
        return user;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.userId };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
