import { IsInt, IsString } from 'class-validator';

export class AdjustStockDto {
  @IsString()
  productId!: string;

  @IsInt()
  delta!: number;
}
