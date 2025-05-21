import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { CacheModule } from '../../core/cache/cache.module';
import { SchedulerService } from './scheduler.service';
import { ReportDeliveryService } from './report-delivery.service';
import { EmailDeliveryStrategy } from './strategy/email-delivery.strategy';
import { InAppDeliveryStrategy } from './strategy/in-app-delivery.strategy';
import { MessagingModule } from '../../core/messaging/messaging.module';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule,
    MessagingModule,
    PortfolioModule,
    TransactionsModule,
  ],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    SchedulerService,
    ReportDeliveryService,
    EmailDeliveryStrategy,
    InAppDeliveryStrategy,
  ],
  exports: [ReportsService, SchedulerService, ReportDeliveryService],
})
export class ReportsModule {
  constructor(
    private readonly reportDeliveryService: ReportDeliveryService,
    private readonly emailDeliveryStrategy: EmailDeliveryStrategy,
    private readonly inAppDeliveryStrategy: InAppDeliveryStrategy,
  ) {
    // Register all delivery strategies
    this.reportDeliveryService.registerStrategy(this.emailDeliveryStrategy);
    this.reportDeliveryService.registerStrategy(this.inAppDeliveryStrategy);
  }
} 