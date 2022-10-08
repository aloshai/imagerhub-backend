import { Global, Module } from "@nestjs/common";
import { ConfigService, ConfigModule } from "@nestjs/config";
import { ClientProxyFactory, ClientsModule, Transport } from "@nestjs/microservices";

@Global()
@Module({
    imports: [
        ConfigModule.forRoot(),
    ],
    providers: [
        {
            provide: 'FILE_SERVICE',
            useFactory: (configService: ConfigService) => {
                return ClientProxyFactory.create({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get('FILE_SERVICE_HOST'),
                        port: configService.get('FILE_SERVICE_PORT')
                    }
                });
            },
            inject: [ConfigService],
        }
    ],
    exports: ['FILE_SERVICE']
})
export class GlobalModule { }