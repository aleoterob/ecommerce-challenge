import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
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

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
