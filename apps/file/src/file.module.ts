import { DiskModule } from '@libs/disk';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FileController } from './file.controller';
import { Image, ImageSchema } from './schemas/image.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DiskModule.forFeature(process.env.DISK_STORAGE_FILENAME),
    MongooseModule.forRoot(process.env.MONGO_DSN),
    MongooseModule.forFeature([
      {
        name: Image.name,
        schema: ImageSchema
      }
    ])
  ],
  controllers: [FileController],
})
export class FileModule {}
