export class PortfolioItemDto {
  symbol: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  totalValue: number;
  profit: number;
  profitPercentage: number;
}

export class PortfolioDto {
  userId: string;
  totalValue: number;
  totalProfit: number;
  totalProfitPercentage: number;
  items: PortfolioItemDto[];
} 