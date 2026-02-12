import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { Product } from '../entities/product.entity';
import { INVENTORY_EVENTS_CLIENT } from '../messaging/rmq.constants';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  it('emits product.created after creating a product', async () => {
    const emit = jest.fn().mockReturnValue(of(undefined));
    const save = jest.fn().mockResolvedValue({
      id: 'p-1',
      title: 'Gaming Mouse',
      description: 'RGB',
      price: '49.90',
      isActive: true,
      lastKnownStock: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Product);
    const create = jest.fn().mockReturnValue({
      title: 'Gaming Mouse',
      description: 'RGB',
      price: '49.90',
      isActive: true,
      lastKnownStock: 0,
    } as Product);

    const moduleRef = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create,
            save,
          },
        },
        {
          provide: INVENTORY_EVENTS_CLIENT,
          useValue: { emit },
        },
      ],
    }).compile();

    const service = moduleRef.get(CatalogService);
    await service.createProduct({
      title: 'Gaming Mouse',
      description: 'RGB',
      price: 49.9,
      isActive: true,
    });

    expect(emit).toHaveBeenCalledWith(
      'product.created',
      expect.objectContaining({
        productId: 'p-1',
        title: 'Gaming Mouse',
      }),
    );
  });
});
