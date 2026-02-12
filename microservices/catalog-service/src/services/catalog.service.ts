import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { CreateProductDto, UpdateProductDto } from '../dto/catalog.dto';
import { Product } from '../entities/product.entity';
import {
  INVENTORY_DELETE_BY_PRODUCT_PATTERN,
  INVENTORY_EVENTS_CLIENT,
  PRODUCT_CREATED_EVENT,
} from '../messaging/rmq.constants';

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

  async updateProduct(
    productId: string,
    payload: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.getProduct(productId);
    if (payload.title !== undefined) product.title = payload.title;
    if (payload.description !== undefined)
      product.description = payload.description || null;
    if (payload.price !== undefined) product.price = payload.price.toFixed(2);
    if (payload.isActive !== undefined) product.isActive = payload.isActive;
    return this.productsRepository.save(product);
  }

  async deleteProduct(productId: string): Promise<void> {
    await firstValueFrom(
      this.inventoryEventsClient.send(INVENTORY_DELETE_BY_PRODUCT_PATTERN, {
        productId,
      }),
    );
    const result = await this.productsRepository.delete({ id: productId });
    if (result.affected === 0) {
      throw new RpcException({
        statusCode: 404,
        message: 'Product not found',
      });
    }
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
