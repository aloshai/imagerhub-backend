import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { Provider } from '@apps/app/enums/provider.enum';
import { User, UserDocument } from '@apps/app/schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(username: string, email: string, provider: Provider, password?: string): Promise<UserDocument> {
        const user = new this.userModel({ username, email, provider, password: crypto.createHash('md5').update(password).digest('hex') });
        return await user.save();
    }

    async findOne(email: string, provider: Provider, password?: string) {
        if (provider === Provider.Local) {
            const hash = crypto.createHash('md5').update(password).digest('hex');
            return await this.userModel.findOne({ email, provider, password: hash });
        }

        const user = await this.userModel.findOne({ email, provider });
        return user;
    }

    generatePassword() {
        const newPassword = crypto.randomBytes(32);

        return newPassword;
    }
}
