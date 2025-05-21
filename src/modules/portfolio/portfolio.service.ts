import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PortfolioDto, PortfolioHoldingDto } from './dto/portfolio.dto';
import { PortfolioRepositoryImpl } from './repositories/portfolio.repository';
import { StocksService } from '../stocks/stocks.service';
import { PortfolioNotFoundException, PortfolioUpdateFailedException } from '../../core/exceptions/domain/portfolio.exceptions';
import { PortfolioRepository } from './repository/portfolio.repository';

/**
 * Service for managing user portfolios
 */
@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    private readonly portfolioRepository: PortfolioRepositoryImpl,
    private readonly stocksService: StocksService,
  ) {}

  /**
   * Get a user's portfolio
   * @param userId User ID
   * @returns Portfolio data
   */
  async getPortfolio(userId: string): Promise<PortfolioDto> {
    try {
      return await this.portfolioRepository.getPortfolio(userId);
    } catch (error) {
      this.logger.error(`Failed to get portfolio for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update portfolio values with current stock prices
   * @param userId User ID
   * @returns Updated portfolio
   */
  async updatePortfolioValue(userId: string): Promise<PortfolioDto> {
    this.logger.log(`Updating portfolio value for user ${userId}`);
    
    // Get the current portfolio
    const portfolio = await this.getPortfolio(userId);
    
    // Calculate new total value based on current prices
    let totalValue = 0;
    
    for (const holding of portfolio.holdings) {
      const stock = await this.stocksService.getStockBySymbol(holding.symbol);
      totalValue += stock.price * holding.quantity;
    }
    
    // Update the portfolio
    portfolio.totalValue = totalValue;
    portfolio.lastUpdated = new Date();
    
    // Save the updated portfolio
    return this.portfolioRepository.updatePortfolio(userId, portfolio);
  }

  /**
   * Add stock to a user's portfolio
   * @param userId User ID
   * @param symbol Stock symbol
   * @param quantity Number of shares
   * @param price Price per share
   * @returns Updated portfolio
   */
  async addStockToPortfolio(
    userId: string,
    symbol: string,
    quantity: number,
    price: number,
  ): Promise<PortfolioDto> {
    try {
      // Get user's current portfolio
      let portfolio: PortfolioDto;
      
      try {
        portfolio = await this.getPortfolio(userId);
      } catch (error) {
        // If portfolio doesn't exist, create a new one
        if (error instanceof NotFoundException) {
          portfolio = {
            userId,
            holdings: [],
            totalValue: 0,
            lastUpdated: new Date(),
          };
        } else {
          throw error;
        }
      }
      
      // Find existing holding for this stock, if any
      const existingHoldingIndex = portfolio.holdings.findIndex(h => h.symbol === symbol);
      
      if (existingHoldingIndex >= 0) {
        // Update existing holding with new average price
        const existing = portfolio.holdings[existingHoldingIndex];
        const totalShares = existing.quantity + quantity;
        const totalCost = (existing.quantity * existing.averagePrice) + (quantity * price);
        const averagePrice = totalCost / totalShares;
        
        portfolio.holdings[existingHoldingIndex] = {
          symbol,
          quantity: totalShares,
          averagePrice,
        };
      } else {
        // Add new holding
        portfolio.holdings.push({
          symbol,
          quantity,
          averagePrice: price,
        });
      }
      
      // Update portfolio total value
      portfolio.totalValue += quantity * price;
      portfolio.lastUpdated = new Date();
      
      // Save updated portfolio
      return this.portfolioRepository.updatePortfolio(userId, portfolio);
    } catch (error) {
      this.logger.error(`Failed to add stock to portfolio: ${error.message}`);
      throw error;
    }
  }
} 