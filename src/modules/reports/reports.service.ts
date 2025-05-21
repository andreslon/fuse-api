import { Injectable, Logger } from '@nestjs/common';
import { PortfolioService } from '../portfolio/portfolio.service';
import { TransactionsService } from '../transactions/transactions.service';
import { ReportDeliveryService } from './report-delivery.service';
import { TransactionDto } from '../transactions/dto/transaction.dto';
import { generateDailyReportHtml } from './templates/daily-report.template';

/**
 * Service for generating and sending reports
 */
@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  private readonly REPORT_CACHE_KEY = 'daily_report_last_run';
  
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly transactionsService: TransactionsService,
    private readonly reportDeliveryService: ReportDeliveryService,
  ) {}

  /**
   * Generate daily transaction reports and send them
   * Collects transaction data and sends via configured delivery methods
   */
  async generateDailyReports(): Promise<void> {
    this.logger.log('Generating daily transaction reports');
    
    try {
      // In a real implementation, you would:
      // 1. Query users from a database
      // 2. Get their transactions for the reporting period
      // 3. Generate report content
      // 4. Send via configured delivery strategies
      
      // For this example, we'll use demo users
      const userIds = await this.getDemoUserIds();
      
      let successCount = 0;
      let failureCount = 0;
      
      for (const userId of userIds) {
        const success = await this.generateAndSendReport(userId);
        if (success) {
          successCount++;
        } else {
          failureCount++;
        }
      }
      
      this.logger.log(`Reports generation complete. Success: ${successCount}, Failures: ${failureCount}`);
    } catch (error) {
      this.logger.error(`Error generating daily reports: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Generate and send a report for a specific user
   * @param userId User ID
   * @returns Boolean indicating success
   */
  private async generateAndSendReport(userId: string): Promise<boolean> {
    try {
      this.logger.log(`Generating report for user: ${userId}`);
      
      // 1. Get user portfolio
      const portfolio = await this.portfolioService.getPortfolio(userId);
      
      // 2. Get user transactions (in a real app, you'd filter by date range)
      const transactions = await this.transactionsService.getTransactionsByUserId(userId);
      
      // 3. Split transactions into successful and failed
      const [successfulTransactions, failedTransactions] = this.categorizeTransactions(transactions);
      
      // 4. Generate HTML report
      const reportContent = generateDailyReportHtml(
        userId,
        successfulTransactions,
        failedTransactions,
      );
      
      // 5. Send the report through all configured delivery methods
      const deliveryResult = await this.reportDeliveryService.deliverReport(
        userId,
        reportContent,
        portfolio,
      );
      
      if (deliveryResult) {
        this.logger.log(`Report for ${userId} delivered successfully`);
        return true;
      } else {
        this.logger.warn(`Report delivery failed for ${userId}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Error generating report for user ${userId}: ${error.message}`, error.stack);
      return false;
    }
  }
  
  /**
   * Categorize transactions into successful and failed
   */
  private categorizeTransactions(transactions: TransactionDto[]): [TransactionDto[], TransactionDto[]] {
    // In a real application, you might have a status field to determine success/failure
    // For this example, we'll assume transactions with price > 0 are successful
    const successful: TransactionDto[] = [];
    const failed: TransactionDto[] = [];
    
    for (const transaction of transactions) {
      if (transaction.price > 0) {
        successful.push(transaction);
      } else {
        failed.push(transaction);
      }
    }
    
    return [successful, failed];
  }
  
  /**
   * Get demo user IDs - in a real app, this would query a database
   */
  private async getDemoUserIds(): Promise<string[]> {
    // In a real app, you would fetch user IDs from a database
    return ['user1', 'user2', 'user3'];
  }
} 