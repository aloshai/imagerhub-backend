import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileModule } from './modules/file/file.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_DSN),
    FileModule
  ],
})
export class AppModule { }
