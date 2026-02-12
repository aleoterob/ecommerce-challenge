import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateProductDto, ProductDto } from '../dto/catalog.dto';
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
}
