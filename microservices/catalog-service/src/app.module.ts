import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogMessagesController } from './controllers/catalog-messages.controller';
import { Product } from './entities/product.entity';
import { CatalogService } from './services/catalog.service';
import { INVENTORY_EVENTS_CLIENT } from './messaging/rmq.constants';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url:
          configService.get<string>('CATALOG_DATABASE_URL') ??
          configService.get<string>('DATABASE_URL'),
        entities: [Product],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Product]),
    ClientsModule.register([
      {
        name: INVENTORY_EVENTS_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: process.env.INVENTORY_QUEUE ?? 'inventory_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [CatalogMessagesController],
  providers: [CatalogService],
})
export class AppModule {}
