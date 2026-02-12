import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AdjustStockDto } from '../dto/inventory.dto';
import {
  INVENTORY_ADJUST_STOCK_PATTERN,
  INVENTORY_SERVICE_CLIENT,
} from '../messaging/rmq.constants';

@Injectable()
export class InventoryGatewayService {
  constructor(
    @Inject(INVENTORY_SERVICE_CLIENT)
    private readonly inventoryClient: ClientProxy,
  ) {}

  async adjustStock(payload: AdjustStockDto): Promise<{
    productId: string;
    quantity: number;
  }> {
    return firstValueFrom(
      this.inventoryClient.send(INVENTORY_ADJUST_STOCK_PATTERN, payload),
    );
  }
}
