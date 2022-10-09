import { ConfigService } from "@nestjs/config";
import { ClientProxyFactory, Transport } from "@nestjs/microservices";

export default {
    provide: 'FILE_SERVICE_CLIENT',
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
