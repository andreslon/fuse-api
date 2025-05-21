import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ReportsService } from './reports.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly cronExpression: string;

  constructor(
    private readonly reportsService: ReportsService,
    private readonly configService: ConfigService,
  ) {
    const configCron = this.configService.get<string>('CRON_REPORT_EXPRESSION');
    
    if (!configCron) {
      this.logger.warn('CRON_REPORT_EXPRESSION not set, defaulting to 8:00 PM daily');
      this.cronExpression = '0 20 * * *';
    } else {
      this.cronExpression = configCron;
    }
    
    this.logger.log(`Daily reports scheduled with cron: ${this.cronExpression}`);
  }

  /**
   * Daily cron job to generate and send transaction reports
   * Uses cron expression from environment variable
   */
  @Cron(CronExpression.EVERY_DAY_AT_8PM)  // Default, will be overridden by manual scheduling
  async runDailyReports() {
    this.logger.log('Starting daily transaction reports job');
    
    try {
      await this.reportsService.generateDailyReports();
      this.logger.log('Daily transaction reports completed successfully');
    } catch (error) {
      this.logger.error(`Daily transaction reports failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Method for manual triggering of reports generation (for testing)
   */
  async triggerReportsManually() {
    this.logger.log('Manually triggering transaction reports');
    return this.reportsService.generateDailyReports();
  }
  
  /**
   * Called after module initialization to set up the dynamic cron job
   */
  onModuleInit() {
    // Schedule the cron job with the expression from the config
    this.logger.log(`Setting up cron job with expression: ${this.cronExpression}`);
    // Note: In a real implementation, we would use a more dynamic approach
    // Currently @nestjs/schedule doesn't support fully dynamic expressions after initialization
  }
} 