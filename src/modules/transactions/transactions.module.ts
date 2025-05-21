import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { VendorModule } from '../vendor/vendor.module';
import { StocksModule } from '../stocks/stocks.module';
import { CacheModule } from '../../core/cache/cache.module';
import { TransactionRepository } from './repository/transaction.repository';
import { PortfolioModule } from '../portfolio/portfolio.module';

@Module({
  imports: [VendorModule, StocksModule, CacheModule, PortfolioModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionRepository],
  exports: [TransactionsService, TransactionRepository],
})
export class TransactionsModule {} 