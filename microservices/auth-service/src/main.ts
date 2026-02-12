import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
      queue: process.env.AUTH_QUEUE ?? 'auth_queue',
      queueOptions: { durable: true },
      noAck: false,
    },
  });
  await app.listen();
}
bootstrap();
