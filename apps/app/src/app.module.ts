import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileModule } from './modules/file/file.module';
import { GlobalModule } from './modules/global/global.module';

@Module({
  imports: [
    GlobalModule,
    MongooseModule.forRoot(process.env.MONGO_DSN),
    FileModule
  ],
})
export class AppModule { }
