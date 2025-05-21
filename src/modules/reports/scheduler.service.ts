import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportsService } from './reports.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Daily cron job that runs at 8:00 PM to generate and send portfolio reports
   * Uses standard cron pattern: '0 20 * * *' = At 8:00 PM every day
   */
  @Cron('0 20 * * *')
  async runDailyReports() {
    this.logger.log('Starting daily portfolio reports job');
    
    try {
      await this.reportsService.generateDailyReports();
      this.logger.log('Daily portfolio reports completed successfully');
    } catch (error) {
      this.logger.error(`Daily portfolio reports failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Method for manual triggering of reports generation (for testing)
   */
  async triggerReportsManually() {
    this.logger.log('Manually triggering portfolio reports');
    return this.reportsService.generateDailyReports();
  }
} 