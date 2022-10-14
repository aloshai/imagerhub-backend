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
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { ConfigService } from '@nestjs/config';

const Command = FfmpegCommand()
  .addOption("-qscale:v 5")
  .addOption("-crf 60")
  .outputFormat('singlejpeg');

@Controller()
export class FileController {
  private logger: Logger = new Logger(FileController.name);
  private s3Client: S3Client;

  constructor(
    private configService: ConfigService,
    @Inject(DiskService) private diskService: DiskService,
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>
  ) {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY")
      },
      region: this.configService.get("AWS_S3_REGION"),
    });
  }

  @MessagePattern("get")
  async getFile(fileName: string) {
    return this.diskService.getFile(fileName);
  }

  @MessagePattern("upload")
  async uploadFile(buffer: { type: "Buffer"; data: any /* is Uint8Array */; }) {
    const inputBuffer = Buffer.from(buffer.data, 'hex');
    const inputReadStream = new Readable({
      objectMode: true,
      encoding: 'hex',
      read() {
        inputReadStream.push(inputBuffer, 'hex');
        inputReadStream.push(null);
      }
    });

    const outputWriteStream = new Writable({
      defaultEncoding: 'hex',
      objectMode: true
    });

    let outputBuffer = Buffer.alloc(0);
    outputWriteStream._write = (chunk, _, next) => {
      outputBuffer = Buffer.concat([outputBuffer, chunk]);
      next();
    }

    return new Promise((resolve, reject) => {
      Command.clone()
        .input(inputReadStream)
        .on('error', (err) => {
          this.logger.error('An error occurred: ' + err.message);
        })
        .on('end', async () => {
          let outputReadStream = new Readable({
            objectMode: true,
            encoding: 'hex',
            read() {
              outputReadStream.push(outputBuffer, 'hex');
              outputReadStream.push(null);
            }
          });

          const objectId = new Types.ObjectId();
          const fileName = "files/" + objectId.toString() + ".jpg";

          const upload = new Upload({
            client: this.s3Client,
            params: {
              Bucket: this.configService.get("AWS_S3_BUCKET"),
              Key: fileName,
              Body: outputReadStream
            }
          });

          await upload.done().then((_) => {
            const image = this.imageModel.create({
              _id: objectId,
              fileName: fileName, // TODO: need a user id
            });

            resolve(image);
          }).catch((err) => {
            this.logger.error(err);
            reject(err);
          });
        })
        .pipe(outputWriteStream, { end: true })
    });
  }

  /**
   * @deprecated The method should not be used, because it is not efficient.
   */
  async uploadFileInDisk(buffer: { type: "Buffer"; data: any /* is Uint8Array */; }) {
    let inputBuffer = Buffer.from(buffer.data, 'hex');
    let inputReadStream = new Readable({
      objectMode: true,
      encoding: 'hex',
      read() {
        inputReadStream.push(inputBuffer, 'hex');
        inputReadStream.push(null);
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

    const objectId = new Types.ObjectId();
    const fileName = objectId.toString() + ".jpg";
    const filePath = this.diskService.createFileInStorage(fileName);

    return new Promise((resolve, reject) => {
      Command.clone()
        .input(inputReadStream)
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
        .pipe(outputWriteStream, { end: true })
    })
  }

  /**
   * @deprecated The method should not be used, because it is not efficient.
   */
  uploadFileInMemory(buffer: { type: "Buffer"; data: any /* is Uint8Array */; }) {
    let inputBuffer = Buffer.from(buffer.data, 'hex');
    let inputReadStream = new Readable({
      objectMode: true,
      encoding: 'hex',
      read() {
        inputReadStream.push(inputBuffer, 'hex');
        inputReadStream.push(null);
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

    Command.clone()
      .input(inputReadStream)
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
      .pipe(outputWriteStream, { end: true });

    return {
      message: "File uploaded successfully"
    }
  }
}
