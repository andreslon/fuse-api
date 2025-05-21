import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for stock purchase request
 */
export class BuyStockDto {
  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Stock symbol to buy' })
  @IsNotEmpty()
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Number of shares to buy', minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
  
  @ApiProperty({ description: 'Price per share', minimum: 0.01 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  price: number;
} 