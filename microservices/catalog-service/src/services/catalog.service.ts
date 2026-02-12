import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { CreateProductDto } from '../dto/catalog.dto';
import { Product } from '../entities/product.entity';
import { INVENTORY_EVENTS_CLIENT, PRODUCT_CREATED_EVENT } from '../messaging/rmq.constants';

type ProductCreatedEvent = {
  productId: string;
  title: string;
  createdAt: string;
};

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @Inject(INVENTORY_EVENTS_CLIENT)
    private readonly inventoryEventsClient: ClientProxy,
  ) {}

  async createProduct(payload: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create({
      title: payload.title,
      description: payload.description ?? null,
      price: payload.price.toFixed(2),
      isActive: payload.isActive ?? true,
      lastKnownStock: 0,
    });
    const savedProduct = await this.productsRepository.save(product);

    const eventPayload: ProductCreatedEvent = {
      productId: savedProduct.id,
      title: savedProduct.title,
      createdAt: savedProduct.createdAt.toISOString(),
    };

    await firstValueFrom(
      this.inventoryEventsClient.emit(PRODUCT_CREATED_EVENT, eventPayload),
    );

    return savedProduct;
  }

  listProducts(): Promise<Product[]> {
    return this.productsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getProduct(productId: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async applyInventoryUpdate(
    productId: string,
    quantity: number,
  ): Promise<void> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      return;
    }
    product.lastKnownStock = quantity;
    await this.productsRepository.save(product);
  }
}
