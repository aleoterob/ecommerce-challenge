import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryMessagesController } from './controllers/inventory-messages.controller';
import { InventoryItem } from './entities/inventory-item.entity';
import { CATALOG_EVENTS_CLIENT } from './messaging/rmq.constants';
import { InventoryService } from './services/inventory.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url:
          configService.get<string>('INVENTORY_DATABASE_URL') ??
          configService.get<string>('DATABASE_URL'),
        entities: [InventoryItem],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([InventoryItem]),
    ClientsModule.register([
      {
        name: CATALOG_EVENTS_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: process.env.CATALOG_QUEUE ?? 'catalog_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [InventoryMessagesController],
  providers: [InventoryService],
})
export class AppModule {}
