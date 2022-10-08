import { Image, ImageSchema } from '@apps/file/src/schemas/image.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileController } from './file.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Image.name,
                schema: ImageSchema
            }
        ]),
    ],
    controllers: [FileController],
})
export class FileModule { }
