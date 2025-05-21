import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for stock purchase request
 */
export class BuyStockDto {
  @ApiProperty({ description: 'User ID', example: 'user1' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Stock symbol to buy', example: 'AAPL' })
  @IsNotEmpty()
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Number of shares to buy', example: 10, minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
} 