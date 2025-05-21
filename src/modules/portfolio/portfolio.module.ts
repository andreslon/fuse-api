import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { CacheModule } from '../../core/cache/cache.module';
import { StocksModule } from '../stocks/stocks.module';
import { PortfolioRepository } from './repository/portfolio.repository';
import { PortfolioRepositoryImpl } from './repositories/portfolio.repository';

@Module({
  imports: [CacheModule, StocksModule],
  controllers: [PortfolioController],
  providers: [
    PortfolioService, 
    PortfolioRepository,
    {
      provide: PortfolioRepositoryImpl,
      useFactory: (repository: PortfolioRepository) => {
        return {
          getPortfolio: (userId: string) => repository.findByUserId(userId),
          updatePortfolio: (userId: string, portfolio: any) => repository.save(portfolio)
        };
      },
      inject: [PortfolioRepository]
    }
  ],
  exports: [PortfolioService, PortfolioRepository, PortfolioRepositoryImpl],
})
export class PortfolioModule {} 