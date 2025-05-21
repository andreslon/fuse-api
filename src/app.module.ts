import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { LoggerModule } from './core/logger/logger.module';
import { CacheModule } from './core/cache/cache.module';
import { QueueModule } from './core/queue/queue.module';
import { MessagingModule } from './core/messaging/messaging.module';
import { ExceptionsModule } from './core/exceptions/exceptions.module';
import { HealthModule } from './modules/health/health.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { VendorModule } from './modules/vendor/vendor.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    CacheModule,
    QueueModule,
    MessagingModule,
    ExceptionsModule,
    HealthModule,
    StocksModule,
    PortfolioModule,
    TransactionsModule,
    ReportsModule,
    VendorModule,
  ],
})
export class AppModule {}
