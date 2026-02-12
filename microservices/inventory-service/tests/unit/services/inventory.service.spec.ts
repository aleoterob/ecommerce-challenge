import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { InventoryItem } from '../../../src/entities/inventory-item.entity';
import { CATALOG_EVENTS_CLIENT } from '../../../src/messaging/rmq.constants';
import { InventoryService } from '../../../src/services/inventory.service';

describe('InventoryService', () => {
  it('adjusts stock and emits inventory.updated', async () => {
    const emit = jest.fn().mockReturnValue(of(undefined));
    const findOne = jest.fn().mockResolvedValue({
      id: 'i-1',
      productId: 'p-1',
      quantity: 4,
    } as InventoryItem);
    const upsert = jest.fn().mockResolvedValue(undefined);
    const save = jest
      .fn()
      .mockImplementation((item: InventoryItem) => Promise.resolve(item));

    const moduleRef = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(InventoryItem),
          useValue: { findOne, save, upsert },
        },
        {
          provide: CATALOG_EVENTS_CLIENT,
          useValue: { emit },
        },
      ],
    }).compile();

    const service = moduleRef.get(InventoryService);
    const result = await service.adjustStock('p-1', -2);

    expect(result).toEqual({ productId: 'p-1', quantity: 2 });
    expect(emit).toHaveBeenCalledWith('inventory.updated', {
      productId: 'p-1',
      quantity: 2,
    });
  });

  it('creates inventory item on first stock adjustment', async () => {
    const save = jest
      .fn()
      .mockImplementation((item: InventoryItem) =>
        Promise.resolve({ ...item, id: 'i-created' }),
      );
    const emit = jest.fn().mockReturnValue(of(undefined));
    const findOne = jest.fn().mockResolvedValue({
      id: 'i-created',
      productId: 'missing-id',
      quantity: 0,
    } as InventoryItem);
    const moduleRef = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(InventoryItem),
          useValue: {
            findOne,
            upsert: jest.fn().mockResolvedValue(undefined),
            save,
          },
        },
        {
          provide: CATALOG_EVENTS_CLIENT,
          useValue: { emit },
        },
      ],
    }).compile();

    const service = moduleRef.get(InventoryService);
    const result = await service.adjustStock('missing-id', 1);
    expect(result).toEqual({ productId: 'missing-id', quantity: 1 });
    expect(save).toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith('inventory.updated', {
      productId: 'missing-id',
      quantity: 1,
    });
  });
});
