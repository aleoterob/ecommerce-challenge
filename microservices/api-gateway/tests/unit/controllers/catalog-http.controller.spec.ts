/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CatalogHttpController } from '../../../src/controllers/catalog-http.controller';
import { CatalogGatewayService } from '../../../src/services/catalog-gateway.service';

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

describe('CatalogHttpController', () => {
  let controller: CatalogHttpController;
  let catalogService: jest.Mocked<CatalogGatewayService>;

  beforeEach(async () => {
    const mockCatalogService = {
      listProducts: jest.fn(),
      getProduct: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogHttpController],
      providers: [
        {
          provide: CatalogGatewayService,
          useValue: mockCatalogService,
        },
      ],
    }).compile();

    controller = module.get<CatalogHttpController>(CatalogHttpController);
    catalogService = module.get(CatalogGatewayService);
  });

  it('listProducts delegates to catalogService', async () => {
    catalogService.listProducts.mockResolvedValue([mockProductDto]);

    const result = await controller.listProducts();

    expect(jest.mocked(catalogService).listProducts).toHaveBeenCalled();
    expect(result).toEqual([mockProductDto]);
  });

  it('getProduct delegates to catalogService', async () => {
    catalogService.getProduct.mockResolvedValue(mockProductDto);

    const result = await controller.getProduct('p-1');

    expect(jest.mocked(catalogService).getProduct).toHaveBeenCalledWith('p-1');
    expect(result).toEqual(mockProductDto);
  });

  it('createProduct delegates to catalogService', async () => {
    catalogService.createProduct.mockResolvedValue(mockProductDto);

    const result = await controller.createProduct({
      title: 'New Product',
      description: 'Desc',
      price: 10,
    });

    expect(jest.mocked(catalogService).createProduct).toHaveBeenCalledWith({
      title: 'New Product',
      description: 'Desc',
      price: 10,
    });
    expect(result).toEqual(mockProductDto);
  });

  it('updateProduct delegates to catalogService', async () => {
    const updated = { ...mockProductDto, title: 'Updated' };
    catalogService.updateProduct.mockResolvedValue(updated);

    const result = await controller.updateProduct('p-1', {
      title: 'Updated',
      price: 25,
    });

    expect(jest.mocked(catalogService).updateProduct).toHaveBeenCalledWith(
      'p-1',
      { title: 'Updated', price: 25 },
    );
    expect(result).toEqual(updated);
  });

  it('deleteProduct delegates to catalogService', async () => {
    catalogService.deleteProduct.mockResolvedValue(undefined);

    await controller.deleteProduct('p-1');

    expect(jest.mocked(catalogService).deleteProduct).toHaveBeenCalledWith(
      'p-1',
    );
  });
});
