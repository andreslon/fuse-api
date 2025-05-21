import { Injectable, Logger } from '@nestjs/common';
import { PortfolioDto } from './dto/portfolio.dto';
import { StocksService } from '../stocks/stocks.service';
import { PortfolioNotFoundException, PortfolioUpdateFailedException } from '../../core/exceptions/domain/portfolio.exceptions';
import { PortfolioRepository } from './repository/portfolio.repository';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    private readonly portfolioRepository: PortfolioRepository,
    private readonly stocksService: StocksService,
  ) {}

  async getPortfolio(userId: string): Promise<PortfolioDto> {
    try {
      // Get portfolio from repository
      const portfolio = await this.portfolioRepository.findByUserId(userId);
      
      // Update current prices and calculations
      return this.updatePortfolioPrices(portfolio);
    } catch (error) {
      if (error instanceof PortfolioNotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to retrieve portfolio: ${error.message}`);
      throw new PortfolioUpdateFailedException(`Failed to retrieve portfolio: ${error.message}`);
    }
  }

  private async updatePortfolioPrices(portfolio: PortfolioDto): Promise<PortfolioDto> {
    try {
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
      portfolio.totalProfitPercentage = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
      
      return portfolio;
    } catch (error) {
      this.logger.error(`Failed to update portfolio prices: ${error.message}`);
      throw new PortfolioUpdateFailedException(`Failed to update portfolio prices: ${error.message}`);
    }
  }
} 