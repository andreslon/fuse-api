import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { CacheModule } from '../../core/cache/cache.module';
import { StocksModule } from '../stocks/stocks.module';

@Module({
  imports: [CacheModule, StocksModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {} 