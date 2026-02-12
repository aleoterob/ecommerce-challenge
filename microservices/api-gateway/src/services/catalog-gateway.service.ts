import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateProductDto, ProductDto, UpdateProductDto } from '../dto/catalog.dto';
import {
  CATALOG_CREATE_PRODUCT_PATTERN,
  CATALOG_DELETE_PRODUCT_PATTERN,
  CATALOG_GET_PRODUCT_PATTERN,
  CATALOG_LIST_PRODUCTS_PATTERN,
  CATALOG_SERVICE_CLIENT,
  CATALOG_UPDATE_PRODUCT_PATTERN,
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

  updateProduct(
    productId: string,
    payload: UpdateProductDto,
  ): Promise<ProductDto> {
    return firstValueFrom(
      this.catalogClient.send(CATALOG_UPDATE_PRODUCT_PATTERN, {
        productId,
        ...payload,
      }),
    );
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      return await firstValueFrom(
        this.catalogClient.send(CATALOG_DELETE_PRODUCT_PATTERN, {
          productId,
        }),
      );
    } catch (error) {
      const err = error as {
        statusCode?: number;
        message?: string;
        error?: string;
      };
      const statusCode = err?.statusCode ?? err?.error;
      const message = err?.message ?? 'Internal server error';
      if (typeof statusCode === 'number' && statusCode >= 400) {
        throw new HttpException(message, statusCode);
      }
      throw error;
    }
  }
}
