import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CreateProductDto,
  ProductDto,
  UpdateProductDto,
} from '../dto/catalog.dto';
import { CatalogGatewayService } from '../services/catalog-gateway.service';

@Controller('products')
export class CatalogHttpController {
  constructor(private readonly catalogService: CatalogGatewayService) {}

  @Get()
  listProducts(): Promise<ProductDto[]> {
    return this.catalogService.listProducts();
  }

  @Get(':id')
  getProduct(@Param('id') productId: string): Promise<ProductDto> {
    return this.catalogService.getProduct(productId);
  }

  @Post()
  createProduct(@Body() payload: CreateProductDto): Promise<ProductDto> {
    return this.catalogService.createProduct(payload);
  }

  @Patch(':id')
  updateProduct(
    @Param('id') productId: string,
    @Body() payload: UpdateProductDto,
  ): Promise<ProductDto> {
    return this.catalogService.updateProduct(productId, payload);
  }

  @Delete(':id')
  deleteProduct(@Param('id') productId: string): Promise<void> {
    return this.catalogService.deleteProduct(productId);
  }
}
