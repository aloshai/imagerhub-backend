import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { CompleteMultipartUploadCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import * as FfmpegCommand from 'fluent-ffmpeg';
import { Readable, Writable } from 'stream';
import { Types } from 'mongoose';

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
  ) {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY")
      },
      region: this.configService.get("AWS_S3_REGION"),
    });
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

          await upload.done().then(async (value: CompleteMultipartUploadCommandOutput) => {
            const image = {
              _id: objectId,
              uri: value.Location,
              key: value.Key,
              bucket: value.Bucket,
              contentType: "image/jpeg",
              size: outputBuffer.length,
            };

            resolve(image);
          }).catch((err) => {
            this.logger.error(err);
            reject(err);
          });
        })
        .pipe(outputWriteStream, { end: true })
    });
  }
}
