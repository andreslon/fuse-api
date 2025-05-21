import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PortfolioDto } from './dto/portfolio.dto';
import { CacheService } from '../../core/cache/cache.service';
import { StocksService } from '../stocks/stocks.service';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);
  private readonly PORTFOLIO_CACHE_PREFIX = 'portfolio:';

  constructor(
    private readonly cacheService: CacheService,
    private readonly stocksService: StocksService,
  ) {}

  async getPortfolio(userId: string): Promise<PortfolioDto> {
    const cacheKey = `${this.PORTFOLIO_CACHE_PREFIX}${userId}`;
    const cachedPortfolio = await this.cacheService.get<PortfolioDto>(cacheKey);
    
    if (cachedPortfolio) {
      // Update current prices and calculations
      return this.updatePortfolioPrices(cachedPortfolio);
    }
    
    // If not found in cache, it means user doesn't have a portfolio yet
    throw new NotFoundException(`Portfolio not found for user ${userId}`);
  }

  private async updatePortfolioPrices(portfolio: PortfolioDto): Promise<PortfolioDto> {
    // Get latest stock prices
    const stocks = await this.stocksService.getStocks();
    const stockMap = new Map(stocks.map(stock => [stock.symbol, stock]));
    
    let totalValue = 0;
    let totalCost = 0;
    
    // Update prices and calculations for each item
    for (const item of portfolio.items) {
      const stock = stockMap.get(item.symbol);
      
      if (stock) {
        item.currentPrice = stock.price;
        item.totalValue = item.quantity * item.currentPrice;
        item.profit = item.totalValue - (item.quantity * item.purchasePrice);
        item.profitPercentage = ((item.currentPrice - item.purchasePrice) / item.purchasePrice) * 100;
        
        totalValue += item.totalValue;
        totalCost += item.quantity * item.purchasePrice;
      }
    }
    
    // Update portfolio totals
    portfolio.totalValue = totalValue;
    portfolio.totalProfit = totalValue - totalCost;
    portfolio.totalProfitPercentage = ((totalValue - totalCost) / totalCost) * 100;
    
    return portfolio;
  }
} 