import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { CacheModule } from '../../core/cache/cache.module';
import { StocksModule } from '../stocks/stocks.module';
import { PortfolioRepositoryImpl } from './repositories/portfolio.repository';
import { Portfolio } from './entities/portfolio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Portfolio]),
    StocksModule,
    CacheModule,
  ],
  controllers: [PortfolioController],
  providers: [
    PortfolioService,
    {
      provide: PortfolioRepositoryImpl,
      useClass: PortfolioRepositoryImpl,
    },
  ],
  exports: [PortfolioService],
})
export class PortfolioModule {} 