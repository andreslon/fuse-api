import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for portfolio holdings (stocks owned by a user)
 */
export class PortfolioHoldingDto {
  @ApiProperty({ description: 'Stock symbol', example: 'AAPL' })
  symbol: string;

  @ApiProperty({ description: 'Number of shares owned', example: 10 })
  quantity: number;

  @ApiProperty({ description: 'Average purchase price', example: 150.75 })
  averagePrice: number;
}

/**
 * DTO for user portfolio data
 */
export class PortfolioDto {
  @ApiProperty({ description: 'User ID', example: 'user1' })
  userId: string;

  @ApiProperty({ description: 'Array of stock holdings', type: [PortfolioHoldingDto] })
  holdings: PortfolioHoldingDto[];

  @ApiProperty({ description: 'Total portfolio value', example: 3000.50 })
  totalValue: number;

  @ApiProperty({ description: 'Last portfolio update time', example: '2023-04-28T12:00:00Z' })
  lastUpdated: Date;
} 