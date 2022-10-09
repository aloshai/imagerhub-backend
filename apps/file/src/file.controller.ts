import { DiskService } from '@libs/disk';
import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { createWriteStream } from 'fs';
import { Model, Types } from 'mongoose';
import { Readable, Writable } from 'stream';
import { Image, ImageDocument } from './schemas/image.schema';
import * as FfmpegCommand from 'fluent-ffmpeg';
import * as crypto from "crypto";

@Controller()
export class FileController {
  private logger: Logger = new Logger(FileController.name);
  @InjectModel(Image.name)
  private readonly imageModel: Model<ImageDocument>;

  @Inject(DiskService)
  private readonly diskService: DiskService;

  @MessagePattern("get")
  async getFile(fileName: string) {
    return this.diskService.getFile(fileName);
  }

  @MessagePattern("upload")
  async uploadFile(buffer: { type: "Buffer"; data: any /* is Uint8Array */; }) {
    let data = Buffer.from(buffer.data, 'hex');
    let stream = new Readable({
      objectMode: true,
      encoding: 'hex',
      read() {
        stream.push(data, 'hex');
        stream.push(null);
      }
    });

    const objectId = new Types.ObjectId();
    const fileName = objectId.toString() + ".jpg";
    const filePath = this.diskService.createFileInStorage(fileName);

    return new Promise((resolve, reject) => {
      FfmpegCommand(stream)
        .addOption("-qscale:v 5")
        .addOption("-crf 60")
        .outputFormat('singlejpeg')
        .output(filePath)
        .on('error', (err) => {
          this.logger.error('An error occurred: ' + err.message);
          reject(err);
        })
        .on('end', async () => {
          let model = await this.imageModel.create({
            _id: objectId,
            fileName: fileName,
            contentType: "image/jpeg"
          });

          this.logger.debug("File saved: " + filePath);
          resolve(model.toJSON());
        })
        .run();
    })
  }

  /**
   * @deprecated The method should not be used, because it is not efficient.
   */
  uploadFileInMemory(buffer: { type: "Buffer"; data: any /* is Uint8Array */; }) {
    let data = Buffer.from(buffer.data, 'hex');
    let stream = new Readable({
      objectMode: true,
      encoding: 'hex',
      read() {
        stream.push(data, 'hex');
        stream.push(null);
      }
    });

    let outputWriteStream = new Writable({
      defaultEncoding: 'hex',
      objectMode: true
    });

    let outputBuffer = Buffer.alloc(0);
    outputWriteStream._write = (chunk, _, next) => {
      outputBuffer = Buffer.concat([outputBuffer, chunk]);
      next();
    }

    FfmpegCommand(stream)
      .addOption("-qscale:v 5")
      .addOption("-crf 60")
      .on('error', (err) => {
        this.logger.error('An error occurred: ' + err.message);
      })
      .on('end', () => {
        const fileName = crypto.randomBytes(32).toString("hex") + ".jpg";
        const filePath = this.diskService.createFileInStorage(fileName);

        let stream = createWriteStream(filePath);
        stream.on("finish", async () => {
          await this.imageModel.create({
            fileName: fileName,
            contentType: "image/jpeg"
          });

          this.logger.debug("File saved: " + filePath);
        });
        stream.on("error", (err) => {
          this.logger.error("File save error: " + err);
        })

        stream.write(outputBuffer, (err) => {
          if (err) {
            this.logger.error(err);
          }
          stream.end();
        });
      })
      .outputFormat('singlejpeg')
      .pipe(outputWriteStream, { end: true });

    return {
      message: "File uploaded successfully"
    }
  }
}
