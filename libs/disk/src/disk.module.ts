import { DynamicModule, Module } from '@nestjs/common';
import { DiskService } from './disk.service';

@Module({ })
export class DiskModule {
  static forFeature(fileName: string): DynamicModule {
    return {
      module: DiskModule,
      providers: [
        {
          useFactory: () => {
            return fileName;
          },
          provide: 'FILE_NAME',
        },
        DiskService
      ],
      exports: [DiskService],
    }
  }
}
