import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { HttpException } from '@nestjs/common';
import { CatalogGatewayService } from './catalog-gateway.service';
import { CATALOG_SERVICE_CLIENT } from '../messaging/rmq.constants';

const mockProductDto = {
  id: 'p-1',
  title: 'Test Product',
  description: 'Desc',
  price: 19.99,
  isActive: true,
  lastKnownStock: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('CatalogGatewayService', () => {
  let service: CatalogGatewayService;
  let catalogClient: { send: jest.Mock };

  beforeEach(async () => {
    catalogClient = { send: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogGatewayService,
        {
          provide: CATALOG_SERVICE_CLIENT,
          useValue: catalogClient,
        },
      ],
    }).compile();

    service = module.get<CatalogGatewayService>(CatalogGatewayService);
  });

  it('listProducts sends to catalog and returns products', async () => {
    catalogClient.send.mockReturnValue(of([mockProductDto]));

    const result = await service.listProducts();

    expect(catalogClient.send).toHaveBeenCalledWith(
      'catalog.list-products',
      {},
    );
    expect(result).toEqual([mockProductDto]);
  });

  it('getProduct sends to catalog and returns product', async () => {
    catalogClient.send.mockReturnValue(of(mockProductDto));

    const result = await service.getProduct('p-1');

    expect(catalogClient.send).toHaveBeenCalledWith('catalog.get-product', {
      productId: 'p-1',
    });
    expect(result).toEqual(mockProductDto);
  });

  it('createProduct sends to catalog and returns created product', async () => {
    catalogClient.send.mockReturnValue(of(mockProductDto));

    const result = await service.createProduct({
      title: 'New Product',
      description: 'Desc',
      price: 10,
    });

    expect(catalogClient.send).toHaveBeenCalledWith(
      'catalog.create-product',
      expect.objectContaining({ title: 'New Product', price: 10 }),
    );
    expect(result).toEqual(mockProductDto);
  });

  it('updateProduct sends to catalog and returns updated product', async () => {
    const updated = { ...mockProductDto, title: 'Updated' };
    catalogClient.send.mockReturnValue(of(updated));

    const result = await service.updateProduct('p-1', {
      title: 'Updated',
      price: 25,
    });

    expect(catalogClient.send).toHaveBeenCalledWith('catalog.update-product', {
      productId: 'p-1',
      title: 'Updated',
      price: 25,
    });
    expect(result).toEqual(updated);
  });

  it('deleteProduct sends to catalog and returns void', async () => {
    catalogClient.send.mockReturnValue(of(undefined));

    const result = await service.deleteProduct('p-1');

    expect(catalogClient.send).toHaveBeenCalledWith('catalog.delete-product', {
      productId: 'p-1',
    });
    expect(result).toBeUndefined();
  });

  it('deleteProduct throws HttpException when catalog returns 404', async () => {
    catalogClient.send.mockReturnValue(
      throwError(() => ({ statusCode: 404, message: 'Product not found' })),
    );

    await expect(service.deleteProduct('non-existent')).rejects.toThrow(
      HttpException,
    );
  });
});
