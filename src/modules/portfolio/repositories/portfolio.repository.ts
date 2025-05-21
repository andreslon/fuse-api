import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PortfolioRepository } from './portfolio-repository.interface';
import { PortfolioDto } from '../dto/portfolio.dto';
import { CacheService } from '../../../core/cache/cache.service';

/**
 * Implementation of the portfolio repository
 * Uses cache for data storage in this demo
 * In a real application, this would use a database
 */
@Injectable()
export class PortfolioRepositoryImpl implements PortfolioRepository {
  private readonly logger = new Logger(PortfolioRepositoryImpl.name);
  private readonly CACHE_KEY_PREFIX = 'portfolio:';
  private readonly CACHE_TTL = 86400000; // 24 hours

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Get a user's portfolio from cache/storage
   */
  async getPortfolio(userId: string): Promise<PortfolioDto> {
    const cacheKey = this.getCacheKey(userId);
    const portfolio = await this.cacheService.get<PortfolioDto>(cacheKey);
    
    if (!portfolio) {
      this.logger.warn(`Portfolio not found for user: ${userId}`);
      throw new NotFoundException(`Portfolio not found for user: ${userId}`);
    }
    
    return portfolio;
  }

  /**
   * Update a user's portfolio in cache/storage
   */
  async updatePortfolio(userId: string, portfolio: PortfolioDto): Promise<PortfolioDto> {
    const cacheKey = this.getCacheKey(userId);
    
    await this.cacheService.set(cacheKey, portfolio, this.CACHE_TTL);
    this.logger.log(`Updated portfolio for user: ${userId}`);
    
    return portfolio;
  }

  /**
   * Helper to generate cache key for a user
   */
  private getCacheKey(userId: string): string {
    return `${this.CACHE_KEY_PREFIX}${userId}`;
  }
} 