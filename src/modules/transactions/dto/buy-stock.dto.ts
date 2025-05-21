import { IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BuyStockDto {
  @ApiProperty({ description: 'User ID', example: 'user1' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Stock symbol', example: 'AAPL' })
  @IsNotEmpty()
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Number of shares to purchase', example: 5, minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
} 