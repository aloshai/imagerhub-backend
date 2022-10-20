import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { FileModule } from './file.module';

async function bootstrap() {
  const configService = new ConfigService();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FileModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: configService.get('FILE_SERVICE_PORT'),
      },
    },
  );
  await app.listen();
}
bootstrap();
