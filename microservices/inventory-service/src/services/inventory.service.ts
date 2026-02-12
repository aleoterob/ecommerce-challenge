import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { InventoryItem } from '../entities/inventory-item.entity';
import { CATALOG_EVENTS_CLIENT, INVENTORY_UPDATED_EVENT } from '../messaging/rmq.constants';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
    @Inject(CATALOG_EVENTS_CLIENT)
    private readonly catalogEventsClient: ClientProxy,
  ) {}

  async createInventoryIfMissing(productId: string): Promise<void> {
    const existingItem = await this.inventoryRepository.findOne({
      where: { productId },
    });
    if (existingItem) {
      return;
    }

    const inventoryItem = this.inventoryRepository.create({
      productId,
      quantity: 0,
    });
    await this.inventoryRepository.save(inventoryItem);
  }

  async adjustStock(
    productId: string,
    delta: number,
  ): Promise<{ productId: string; quantity: number }> {
    await this.inventoryRepository.upsert(
      {
        productId,
        quantity: 0,
      },
      ['productId'],
    );
    const item = await this.inventoryRepository.findOne({
      where: { productId },
    });
    if (!item) {
      throw new Error('Failed to load inventory item after upsert');
    }

    const quantity = Math.max(item.quantity + delta, 0);
    item.quantity = quantity;
    await this.inventoryRepository.save(item);

    await firstValueFrom(
      this.catalogEventsClient.emit(INVENTORY_UPDATED_EVENT, {
        productId,
        quantity,
      }),
    );

    return { productId, quantity };
  }

  async deleteByProductId(productId: string): Promise<void> {
    await this.inventoryRepository.delete({ productId });
  }
}
