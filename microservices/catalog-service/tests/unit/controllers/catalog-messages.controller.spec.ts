import { Test, TestingModule } from '@nestjs/testing';
import { RmqContext } from '@nestjs/microservices';
import { CatalogMessagesController } from '../../../src/controllers/catalog-messages.controller';
import { CatalogService } from '../../../src/services/catalog.service';
import { Product } from '../../../src/entities/product.entity';

describe('CatalogMessagesController', () => {
  let controller: CatalogMessagesController;
  let catalogService: jest.Mocked<CatalogService>;

  const mockProduct: Product = {
    id: 'p-1',
    title: 'Test Product',
    description: 'Desc',
    price: '19.99',
    isActive: true,
    lastKnownStock: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Product;

  const ackMock = jest.fn();
  const mockContext = {
    getChannelRef: () => ({ ack: ackMock }),
    getMessage: () => ({}),
  } as unknown as RmqContext;

  beforeEach(async () => {
    const mockCatalogService = {
      createProduct: jest.fn(),
      listProducts: jest.fn(),
      getProduct: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogMessagesController],
      providers: [
        {
          provide: CatalogService,
          useValue: mockCatalogService,
        },
      ],
    }).compile();

    controller = module.get<CatalogMessagesController>(
      CatalogMessagesController,
    );
    catalogService = module.get(CatalogService);
  });

  it('createProduct delegates to catalogService and returns product', async () => {
    catalogService.createProduct.mockResolvedValue(mockProduct);

    const result = await controller.createProduct(
      { title: 'Test Product', description: 'Desc', price: 19.99 },
      mockContext,
    );

    expect(catalogService.createProduct.mock.calls[0]).toEqual([
      { title: 'Test Product', description: 'Desc', price: 19.99 },
    ]);
    expect(result).toEqual(mockProduct);
  });

  it('listProducts delegates to catalogService and returns products', async () => {
    catalogService.listProducts.mockResolvedValue([mockProduct]);

    const result = await controller.listProducts(mockContext);

    expect(catalogService.listProducts.mock.calls).toHaveLength(1);
    expect(result).toEqual([mockProduct]);
  });

  it('getProduct delegates to catalogService and returns product', async () => {
    catalogService.getProduct.mockResolvedValue(mockProduct);

    const result = await controller.getProduct(
      { productId: 'p-1' },
      mockContext,
    );

    expect(catalogService.getProduct.mock.calls[0]).toEqual(['p-1']);
    expect(result).toEqual(mockProduct);
  });

  it('updateProduct delegates to catalogService and returns updated product', async () => {
    const updated = { ...mockProduct, title: 'Updated', price: '29.99' };
    catalogService.updateProduct.mockResolvedValue(updated as Product);

    const result = await controller.updateProduct(
      { productId: 'p-1', title: 'Updated', price: 29.99 },
      mockContext,
    );

    expect(catalogService.updateProduct.mock.calls[0]).toEqual([
      'p-1',
      { title: 'Updated', price: 29.99 },
    ]);
    expect(result.title).toBe('Updated');
  });

  it('deleteProduct delegates to catalogService and returns deleted', async () => {
    catalogService.deleteProduct.mockResolvedValue(undefined);

    const result = await controller.deleteProduct(
      { productId: 'p-1' },
      mockContext,
    );

    expect(catalogService.deleteProduct.mock.calls[0]).toEqual(['p-1']);
    expect(result).toEqual({ deleted: true });
  });
});
