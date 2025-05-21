import { ApiProperty } from '@nestjs/swagger';

export class PortfolioItemDto {
  @ApiProperty({ description: 'Stock symbol', example: 'AAPL' })
  symbol: string;

  @ApiProperty({ description: 'Number of shares owned', example: 10 })
  quantity: number;

  @ApiProperty({ description: 'Average purchase price per share', example: 150.75 })
  purchasePrice: number;

  @ApiProperty({ description: 'Current market price per share', example: 155.25 })
  currentPrice: number;

  @ApiProperty({ description: 'Total value of the holding', example: 1552.50 })
  totalValue: number;

  @ApiProperty({ description: 'Profit/loss amount', example: 45.00 })
  profit: number;

  @ApiProperty({ description: 'Profit/loss percentage', example: 3.25 })
  profitPercentage: number;
}

export class PortfolioDto {
  @ApiProperty({ description: 'User ID', example: 'user1' })
  userId: string;

  @ApiProperty({ description: 'Total portfolio value', example: 4500.75 })
  totalValue: number;

  @ApiProperty({ description: 'Total portfolio profit/loss', example: 350.25 })
  totalProfit: number;

  @ApiProperty({ description: 'Total portfolio profit/loss percentage', example: 8.43 })
  totalProfitPercentage: number;

  @ApiProperty({ description: 'Portfolio holdings', type: [PortfolioItemDto] })
  items: PortfolioItemDto[];
} 