import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsService } from './reports.service';
import { CacheModule } from '../../core/cache/cache.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule,
  ],
  providers: [ReportsService, SchedulerService],
  exports: [ReportsService, SchedulerService],
})
export class ReportsModule {} 