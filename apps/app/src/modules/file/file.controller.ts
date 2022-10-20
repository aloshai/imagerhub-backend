import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { firstValueFrom } from 'rxjs';
import { isValidObjectId, Model } from 'mongoose';
import { Response } from 'express';
import { Image, ImageDocument } from '@libs/common/schemas/image.schema';
import { InjectModel } from '@nestjs/mongoose';
import { IServiceFileUploadResponse } from '@libs/common/interfaces/file/service-file-upload-response.interface';
import { CreateImageDto } from '@libs/common/dto/create-image.dto';
import { IServiceFileUploadRequest } from '@libs/common/interfaces/file/service-file-upload-request.interface';

@Controller('file')
export class FileController {
  constructor(
    @Inject('FILE_SERVICE_CLIENT') private fileService: ClientProxy,
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
  ) {}

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() response: Response) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException();
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // TODO: need a disk because of the size (32-64MB+)
    }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 16 })],
      }),
    )
    file: Express.Multer.File,
    @Body() createImageDto: CreateImageDto,
  ) {
    try {
      const image: IServiceFileUploadResponse = await firstValueFrom(
        this.fileService.send('upload', {
          buffer: file.buffer.toJSON(),
          name: createImageDto.name,
          alt: createImageDto.alt,
        } as IServiceFileUploadRequest),
      );

      return this.imageModel.create(image);
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        throw new InternalServerErrorException('File service is unavailable');
      } else {
        throw new InternalServerErrorException(err);
      }
    }
  }
}
