import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../../../core/cache/cache.service';
import { PortfolioDto } from '../dto/portfolio.dto';
import { PortfolioNotFoundException } from '../../../core/exceptions/domain/portfolio.exceptions';

@Injectable()
export class PortfolioRepository {
  private readonly logger = new Logger(PortfolioRepository.name);
  private readonly PORTFOLIO_CACHE_PREFIX = 'portfolio:';

  constructor(private readonly cacheService: CacheService) {}

  async findByUserId(userId: string): Promise<PortfolioDto> {
    const cacheKey = `${this.PORTFOLIO_CACHE_PREFIX}${userId}`;
    const portfolio = await this.cacheService.get<PortfolioDto>(cacheKey);
    
    if (!portfolio) {
      throw new PortfolioNotFoundException(userId);
    }
    
    return portfolio;
  }

  async save(portfolio: PortfolioDto): Promise<PortfolioDto> {
    const cacheKey = `${this.PORTFOLIO_CACHE_PREFIX}${portfolio.userId}`;
    await this.cacheService.set(cacheKey, portfolio);
    return portfolio;
  }

  async findOrCreate(userId: string): Promise<PortfolioDto> {
    try {
      return await this.findByUserId(userId);
    } catch (error) {
      if (error instanceof PortfolioNotFoundException) {
        // Create new portfolio
        const newPortfolio: PortfolioDto = {
          userId,
          totalValue: 0,
          holdings: [],
          lastUpdated: new Date(),
        };
        
        return await this.save(newPortfolio);
      }
      throw error;
    }
  }
}
 