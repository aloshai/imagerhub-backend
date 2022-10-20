import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileController } from './file.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [FileController],
})
export class FileModule {}
