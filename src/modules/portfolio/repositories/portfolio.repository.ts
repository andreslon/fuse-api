import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioRepository } from './portfolio-repository.interface';
import { PortfolioDto, PortfolioHoldingDto } from '../dto/portfolio.dto';
import { Portfolio } from '../entities/portfolio.entity';

/**
 * Implementation of the portfolio repository
 * Uses TypeORM for database operations
 */
@Injectable()
export class PortfolioRepositoryImpl implements PortfolioRepository {
  private readonly logger = new Logger(PortfolioRepositoryImpl.name);

  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepo: Repository<Portfolio>,
  ) {}

  /**
   * Get a user's portfolio from database
   */
  async getPortfolio(userId: string): Promise<PortfolioDto> {
    // Get all portfolio entries for the user
    const portfolioEntries = await this.portfolioRepo.find({
      where: { userId },
    });
    
    if (!portfolioEntries || portfolioEntries.length === 0) {
      // Return empty portfolio rather than throwing an error
      return {
        userId,
        holdings: [],
        totalValue: 0,
        lastUpdated: new Date(),
      };
    }
    
    // Map portfolio entries to holdings
    const holdings: PortfolioHoldingDto[] = portfolioEntries.map(entry => ({
      symbol: entry.symbol,
      quantity: Number(entry.quantity),
      averagePrice: Number(entry.averagePrice),
    }));
    
    // Calculate total value
    const totalValue = portfolioEntries.reduce(
      (sum, entry) => sum + Number(entry.totalValue),
      0
    );
    
    // Get the most recent update time
    const lastUpdated = portfolioEntries.reduce(
      (latest, entry) => (entry.updatedAt > latest ? entry.updatedAt : latest),
      new Date(0)
    );
    
    return {
      userId,
      holdings,
      totalValue,
      lastUpdated,
    };
  }

  /**
   * Update a user's portfolio in database
   * This method will add or update a single holding
   */
  async updatePortfolio(userId: string, updatedPortfolio: PortfolioDto): Promise<PortfolioDto> {
    try {
      // Process each holding in the updated portfolio
      for (const holding of updatedPortfolio.holdings) {
        // Check if this holding already exists
        let portfolioEntry = await this.portfolioRepo.findOne({
          where: {
            userId,
            symbol: holding.symbol,
          },
        });
        
        if (portfolioEntry) {
          // Update existing entry
          portfolioEntry.quantity = holding.quantity;
          portfolioEntry.averagePrice = holding.averagePrice;
          portfolioEntry.totalValue = holding.quantity * holding.averagePrice;
        } else {
          // Create new entry
          portfolioEntry = this.portfolioRepo.create({
            userId,
            symbol: holding.symbol,
            quantity: holding.quantity,
            averagePrice: holding.averagePrice,
            totalValue: holding.quantity * holding.averagePrice,
          });
        }
        
        // Save to database
        await this.portfolioRepo.save(portfolioEntry);
      }
      
      this.logger.log(`Updated portfolio for user: ${userId}`);
      
      // Return the updated portfolio
      return this.getPortfolio(userId);
    } catch (error) {
      this.logger.error(`Failed to update portfolio: ${error.message}`, error.stack);
      throw error;
    }
  }
} 