import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { AdjustStockDto } from '../dto/inventory.dto';
import {
  INVENTORY_DELETE_BY_PRODUCT_PATTERN,
  PRODUCT_CREATED_EVENT,
} from '../messaging/rmq.constants';
import { InventoryService } from '../services/inventory.service';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class InventoryMessagesController {
  constructor(private readonly inventoryService: InventoryService) {}

  @EventPattern(PRODUCT_CREATED_EVENT)
  async onProductCreated(
    @Payload() payload: { productId: string },
    @Ctx() context: RmqContext,
  ): Promise<void> {
    this.ack(context);
    await this.inventoryService.createInventoryIfMissing(payload.productId);
  }

  @MessagePattern(INVENTORY_DELETE_BY_PRODUCT_PATTERN)
  async deleteByProduct(
    @Payload() payload: { productId: string },
    @Ctx() context: RmqContext,
  ): Promise<{ deleted: boolean }> {
    this.ack(context);
    await this.inventoryService.deleteByProductId(payload.productId);
    return { deleted: true };
  }

  @MessagePattern('inventory.adjust-stock')
  async adjustStock(
    @Payload() payload: AdjustStockDto,
    @Ctx() context: RmqContext,
  ): Promise<{ productId: string; quantity: number }> {
    this.ack(context);
    return this.inventoryService.adjustStock(payload.productId, payload.delta);
  }

  private ack(context: RmqContext): void {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
