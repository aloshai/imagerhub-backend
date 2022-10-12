import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileModule } from './modules/file/file.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import Configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [Configuration]
    }),
    MongooseModule.forRoot(process.env.MONGO_DSN),
    FileModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule { }
