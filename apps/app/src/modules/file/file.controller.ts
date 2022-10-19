import { Controller, Get, Inject, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { firstValueFrom } from 'rxjs';
import { isValidObjectId, Model } from 'mongoose';
import { Response } from 'express';
import { Image, ImageDocument } from '@apps/app/schemas/image.schema';
import { InjectModel } from '@nestjs/mongoose';

@Controller('file')
export class FileController {
    constructor(@Inject('FILE_SERVICE_CLIENT') private fileService: ClientProxy, @InjectModel(Image.name) private imageModel: Model<ImageDocument>) { }

    @Get(":id")
    async getFile(@Param('id') id: string, @Res() response: Response) {
        if (!isValidObjectId(id)) {
            throw new NotFoundException();
        }

        const image = await this.imageModel.findById(id);
        if (!image) {
            throw new NotFoundException();
        }

        response.set('Content-Type', image.contentType);
        response.set('Content-Length', image.size.toString());
        response.set('Content-Disposition', `inline; filename="${image._id}"`);

        response.redirect(image.uri);
    }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage()
    }))
    async uploadFile(@UploadedFile(new ParseFilePipe({
        fileIsRequired: true,
        validators: [
            new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 16 }),
        ]
    })) file: Express.Multer.File) {
        const image = await firstValueFrom(this.fileService.send('upload', file.buffer));

        return this.imageModel.create(image);
    }
}
