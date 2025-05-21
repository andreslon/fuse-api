import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { CacheModule } from '../../core/cache/cache.module';
import { StocksModule } from '../stocks/stocks.module';
import { PortfolioRepository } from './repository/portfolio.repository';

@Module({
  imports: [CacheModule, StocksModule],
  controllers: [PortfolioController],
  providers: [PortfolioService, PortfolioRepository],
  exports: [PortfolioService, PortfolioRepository],
})
export class PortfolioModule {} 