import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { VendorModule } from '../vendor/vendor.module';
import { StocksModule } from '../stocks/stocks.module';
import { CacheModule } from '../../core/cache/cache.module';

@Module({
  imports: [VendorModule, StocksModule, CacheModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {} 