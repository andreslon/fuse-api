import { ApiProperty } from '@nestjs/swagger';

export class StockDto {
  @ApiProperty({ description: 'Stock symbol', example: 'AAPL' })
  symbol: string;
  
  @ApiProperty({ description: 'Company name', example: 'Apple Inc.' })
  name: string;
  
  @ApiProperty({ description: 'Current stock price', example: 150.75 })
  price: number;
  
  @ApiProperty({ description: 'Price change percentage', example: 2.5 })
  change: number;
  
  @ApiProperty({ description: 'Stock market', example: 'NASDAQ' })
  market: string;
} 