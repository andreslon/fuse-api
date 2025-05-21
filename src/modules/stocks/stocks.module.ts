import { Module } from '@nestjs/common';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';
import { VendorModule } from '../vendor/vendor.module';
import { CacheModule } from '../../core/cache/cache.module';

@Module({
  imports: [VendorModule, CacheModule],
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {} 