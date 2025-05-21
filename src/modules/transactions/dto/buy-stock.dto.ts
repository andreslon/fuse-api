import { IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class BuyStockDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  symbol: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
} 