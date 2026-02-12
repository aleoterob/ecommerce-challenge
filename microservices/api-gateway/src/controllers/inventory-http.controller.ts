import { Body, Controller, Patch } from '@nestjs/common';
import { AdjustStockDto } from '../dto/inventory.dto';
import { InventoryGatewayService } from '../services/inventory-gateway.service';

@Controller('inventory')
export class InventoryHttpController {
  constructor(private readonly inventoryService: InventoryGatewayService) {}

  @Patch('adjust')
  adjustStock(
    @Body() payload: AdjustStockDto,
  ): Promise<{ productId: string; quantity: number }> {
    return this.inventoryService.adjustStock(payload);
  }
}
