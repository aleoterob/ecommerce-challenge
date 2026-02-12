import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CreateProductDto } from '../dto/catalog.dto';
import { Product } from '../entities/product.entity';
import { INVENTORY_UPDATED_EVENT } from '../messaging/rmq.constants';
import { CatalogService } from '../services/catalog.service';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CatalogMessagesController {
  constructor(private readonly catalogService: CatalogService) {}

  @MessagePattern('catalog.create-product')
  async createProduct(
    @Payload() payload: CreateProductDto,
    @Ctx() context: RmqContext,
  ): Promise<Product> {
    this.ack(context);
    return this.catalogService.createProduct(payload);
  }

  @MessagePattern('catalog.list-products')
  async listProducts(@Ctx() context: RmqContext): Promise<Product[]> {
    this.ack(context);
    return this.catalogService.listProducts();
  }

  @MessagePattern('catalog.get-product')
  async getProduct(
    @Payload() payload: { productId: string },
    @Ctx() context: RmqContext,
  ): Promise<Product> {
    this.ack(context);
    return this.catalogService.getProduct(payload.productId);
  }

  @EventPattern(INVENTORY_UPDATED_EVENT)
  async onInventoryUpdated(
    @Payload() payload: { productId: string; quantity: number },
    @Ctx() context: RmqContext,
  ): Promise<void> {
    this.ack(context);
    await this.catalogService.applyInventoryUpdate(payload.productId, payload.quantity);
  }

  private ack(context: RmqContext): void {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
