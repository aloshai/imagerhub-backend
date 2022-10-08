import { Controller, Get, Inject, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { firstValueFrom } from 'rxjs';
import { isValidObjectId, Model } from 'mongoose';
import { Response } from 'express';
import { Image, ImageDocument } from '@apps/file/src/schemas/image.schema';
import { InjectModel } from '@nestjs/mongoose';
import { parse } from 'path';

@Controller('file')
export class FileController {
    constructor(@Inject('FILE_SERVICE') private fileService: ClientProxy, @InjectModel(Image.name) private imageModel: Model<ImageDocument>) { }

    @Get(":id")
    async getFile(@Param('id') id: string, @Res() response: Response) {
        if (!isValidObjectId(id)) {
            throw new NotFoundException();
        }

        const image = await this.imageModel.findById(id);
        if (!image) {
            throw new NotFoundException();
        }

        const filePath = await firstValueFrom(this.fileService.send('get', image.fileName));
        if (filePath == null) {
            throw new NotFoundException();
        }

        const _path = parse(filePath);
        response.sendFile(_path.base, { root: _path.dir });
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
        return await firstValueFrom(this.fileService.send('upload', file.buffer));
    }
}
