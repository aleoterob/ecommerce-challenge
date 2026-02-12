import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthHttpController } from './controllers/auth-http.controller';
import { CatalogHttpController } from './controllers/catalog-http.controller';
import { InventoryHttpController } from './controllers/inventory-http.controller';
import {
  AUTH_SERVICE_CLIENT,
  CATALOG_SERVICE_CLIENT,
  INVENTORY_SERVICE_CLIENT,
} from './messaging/rmq.constants';
import { AuthGatewayService } from './services/auth-gateway.service';
import { CatalogGatewayService } from './services/catalog-gateway.service';
import { InventoryGatewayService } from './services/inventory-gateway.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: AUTH_SERVICE_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: process.env.AUTH_QUEUE ?? 'auth_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: CATALOG_SERVICE_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: process.env.CATALOG_QUEUE ?? 'catalog_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: INVENTORY_SERVICE_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: process.env.INVENTORY_QUEUE ?? 'inventory_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [
    AuthHttpController,
    CatalogHttpController,
    InventoryHttpController,
  ],
  providers: [
    AuthGatewayService,
    CatalogGatewayService,
    InventoryGatewayService,
  ],
})
export class AppModule {}
