import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ProductDto {
  id!: string;
  title!: string;
  description?: string;
  price!: number;
  isActive!: boolean;
  lastKnownStock!: number;
  createdAt!: string;
  updatedAt!: string;
}
