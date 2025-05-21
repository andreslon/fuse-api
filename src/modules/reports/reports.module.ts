import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsService } from './reports.service';
import { CacheModule } from '../../core/cache/cache.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule,
  ],
  providers: [ReportsService],
})
export class ReportsModule {} 