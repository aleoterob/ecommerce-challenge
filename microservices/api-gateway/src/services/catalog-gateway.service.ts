import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateProductDto, ProductDto } from '../dto/catalog.dto';
import {
  CATALOG_CREATE_PRODUCT_PATTERN,
  CATALOG_GET_PRODUCT_PATTERN,
  CATALOG_LIST_PRODUCTS_PATTERN,
  CATALOG_SERVICE_CLIENT,
} from '../messaging/rmq.constants';

@Injectable()
export class CatalogGatewayService {
  constructor(
    @Inject(CATALOG_SERVICE_CLIENT) private readonly catalogClient: ClientProxy,
  ) {}

  async listProducts(): Promise<ProductDto[]> {
    return firstValueFrom(this.catalogClient.send(CATALOG_LIST_PRODUCTS_PATTERN, {}));
  }

  async getProduct(productId: string): Promise<ProductDto> {
    return firstValueFrom(
      this.catalogClient.send(CATALOG_GET_PRODUCT_PATTERN, { productId }),
    );
  }

  async createProduct(payload: CreateProductDto): Promise<ProductDto> {
    return firstValueFrom(
      this.catalogClient.send(CATALOG_CREATE_PRODUCT_PATTERN, payload),
    );
  }
}
