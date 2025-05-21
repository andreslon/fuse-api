import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for stock data
 */
export class StockDto {
  @ApiProperty({ description: 'Stock symbol', example: 'AAPL' })
  symbol: string;
  
  @ApiProperty({ description: 'Company name', example: 'Apple Inc' })
  name: string;
  
  @ApiProperty({ description: 'Current stock price', example: 175.50 })
  price: number;
  
  @ApiProperty({ description: 'Market where the stock is traded', example: 'NASDAQ' })
  market: string;
  
  @ApiProperty({ description: 'Last price update timestamp', example: '2023-04-28T12:00:00Z' })
  lastUpdated: Date;
} 