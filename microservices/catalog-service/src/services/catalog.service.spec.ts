import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { Product } from '../entities/product.entity';
import { INVENTORY_EVENTS_CLIENT } from '../messaging/rmq.constants';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  it('listProducts returns all products ordered by createdAt desc', async () => {
    const products = [
      {
        id: 'p-1',
        title: 'First',
        description: '',
        price: '10',
        isActive: true,
        lastKnownStock: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'p-2',
        title: 'Second',
        description: '',
        price: '20',
        isActive: true,
        lastKnownStock: 1,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
    ] as Product[];
    const findMock = jest.fn().mockResolvedValue(products);

    const moduleRef = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: findMock,
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: INVENTORY_EVENTS_CLIENT,
          useValue: {
            emit: jest.fn(),
            send: jest.fn().mockReturnValue(of(undefined)),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(CatalogService);
    const result = await service.listProducts();

    expect(findMock).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
    expect(result).toEqual(products);
  });

  it('getProduct returns product when found', async () => {
    const product = {
      id: 'p-1',
      title: 'Found',
      description: '',
      price: '10',
      isActive: true,
      lastKnownStock: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Product;
    const findOneMock = jest.fn().mockResolvedValue(product);

    const moduleRef = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: findOneMock,
            delete: jest.fn(),
          },
        },
        {
          provide: INVENTORY_EVENTS_CLIENT,
          useValue: {
            emit: jest.fn(),
            send: jest.fn().mockReturnValue(of(undefined)),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(CatalogService);
    const result = await service.getProduct('p-1');

    expect(findOneMock).toHaveBeenCalledWith({ where: { id: 'p-1' } });
    expect(result).toEqual(product);
  });

  it('getProduct throws NotFoundException when product not found', async () => {
    const findOneMock = jest.fn().mockResolvedValue(null);

    const moduleRef = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: findOneMock,
            delete: jest.fn(),
          },
        },
        {
          provide: INVENTORY_EVENTS_CLIENT,
          useValue: {
            emit: jest.fn(),
            send: jest.fn().mockReturnValue(of(undefined)),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(CatalogService);

    await expect(service.getProduct('non-existent')).rejects.toThrow(
      'Product not found',
    );
  });

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

  it('deletes a product by id', async () => {
    const deleteMock = jest.fn().mockResolvedValue({ affected: 1 });
    const sendMock = jest.fn().mockReturnValue(of(undefined));

    const moduleRef = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: deleteMock,
          },
        },
        {
          provide: INVENTORY_EVENTS_CLIENT,
          useValue: { emit: jest.fn(), send: sendMock },
        },
      ],
    }).compile();

    const service = moduleRef.get(CatalogService);
    await service.deleteProduct('p-to-delete');

    expect(sendMock).toHaveBeenCalledWith('inventory.delete-by-product', {
      productId: 'p-to-delete',
    });
    expect(deleteMock).toHaveBeenCalledWith({ id: 'p-to-delete' });
  });

  it('throws when product does not exist', async () => {
    const deleteMock = jest.fn().mockResolvedValue({ affected: 0 });
    const sendMock = jest.fn().mockReturnValue(of(undefined));

    const moduleRef = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: deleteMock,
          },
        },
        {
          provide: INVENTORY_EVENTS_CLIENT,
          useValue: { emit: jest.fn(), send: sendMock },
        },
      ],
    }).compile();

    const service = moduleRef.get(CatalogService);

    await expect(service.deleteProduct('non-existent')).rejects.toThrow(
      'Product not found',
    );
  });

  it('updates a product by id', async () => {
    const existingProduct = {
      id: 'p-1',
      title: 'Original',
      description: 'Original desc',
      price: '10.00',
      isActive: true,
      lastKnownStock: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Product;
    const saveMock = jest.fn().mockImplementation((entity: Product) => {
      return Promise.resolve({ ...existingProduct, ...entity });
    });
    const findOneMock = jest.fn().mockResolvedValue(existingProduct);

    const moduleRef = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: saveMock,
            find: jest.fn(),
            findOne: findOneMock,
          },
        },
        {
          provide: INVENTORY_EVENTS_CLIENT,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    const service = moduleRef.get(CatalogService);
    const result = await service.updateProduct('p-1', {
      title: 'Updated Title',
      description: 'Updated desc',
      price: 25,
    });

    expect(findOneMock).toHaveBeenCalledWith({ where: { id: 'p-1' } });
    expect(saveMock).toHaveBeenCalled();
    expect(result.title).toBe('Updated Title');
    expect(result.description).toBe('Updated desc');
    expect(result.price).toBe('25.00');
  });

  it('updateProduct throws NotFoundException when product does not exist', async () => {
    const findOneMock = jest.fn().mockResolvedValue(null);

    const moduleRef = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: findOneMock,
          },
        },
        {
          provide: INVENTORY_EVENTS_CLIENT,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    const service = moduleRef.get(CatalogService);

    await expect(
      service.updateProduct('non-existent', { title: 'New Title' }),
    ).rejects.toThrow('Product not found');
  });
});
