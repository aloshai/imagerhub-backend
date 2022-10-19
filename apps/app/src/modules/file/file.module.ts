import { Image, ImageSchema } from '@apps/app/schemas/image.schema';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import FileServiceProvider from '../../providers/file-service.provider';
import { FileController } from './file.controller';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([
            {
                name: Image.name,
                schema: ImageSchema
            }
        ]),
    ],
    providers: [FileServiceProvider],
    controllers: [FileController],
    exports: ['FILE_SERVICE_CLIENT']
})
export class FileModule { }
