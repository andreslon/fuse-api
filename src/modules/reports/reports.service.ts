import { Injectable, Logger } from '@nestjs/common';
import { PortfolioService } from '../portfolio/portfolio.service';
import { TransactionsService } from '../transactions/transactions.service';
import { ReportDeliveryService } from './report-delivery.service';
import { TransactionDto } from '../transactions/dto/transaction.dto';
import { generateDailyReportHtml } from './templates/daily-report.template';
import { SendGridService } from '../../core/messaging/email/sendgrid.service';

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
    private readonly sendGridService: SendGridService,
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
   * Generate and send a report to a specific email address
   * @param userId User ID to generate report for
   * @param email Email address to send the report to
   * @param includeTransactions Whether to include transaction details
   * @param includePortfolio Whether to include portfolio details
   * @returns Boolean indicating success
   */
  async generateAndSendReportToEmail(
    userId: string,
    email: string,
    includeTransactions: boolean = true,
    includePortfolio: boolean = true
  ): Promise<boolean> {
    try {
      this.logger.log(`Generating custom report for user ${userId} to send to ${email}`);
      
      // 1. Get user portfolio
      const portfolio = await this.portfolioService.getPortfolio(userId);
      
      // 2. Get user transactions
      const transactions = await this.transactionsService.getTransactionsByUserId(userId);
      
      // 3. Split transactions into successful and failed
      const [successfulTransactions, failedTransactions] = this.categorizeTransactions(transactions);
      
      // 4. Generate HTML report content with optional sections
      const reportContent = this.generateCustomReportHtml(
        userId,
        successfulTransactions,
        failedTransactions,
        includeTransactions,
        includePortfolio,
        portfolio
      );
      
      // 5. Send the email directly to the specified address
      await this.sendGridService.sendEmail({
        to: email,
        subject: `Transaction Report for ${userId}`,
        html: reportContent,
        text: this.createTextVersion(userId, successfulTransactions.length, failedTransactions.length),
      });
      
      this.logger.log(`Custom report sent successfully to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending custom report to ${email}: ${error.message}`, error.stack);
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
   * Generate a custom HTML report
   */
  private generateCustomReportHtml(
    userId: string,
    successfulTransactions: TransactionDto[],
    failedTransactions: TransactionDto[],
    includeTransactions: boolean,
    includePortfolio: boolean,
    portfolio: any
  ): string {
    // In a real application, you'd use a template engine
    // For simplicity, we'll just construct HTML directly
    
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    let html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
          .container { padding: 20px; }
          .section { margin-bottom: 20px; }
          .summary { background-color: #f2f2f2; padding: 15px; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          .success { color: green; }
          .failure { color: red; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Transaction Report</h1>
          <p>User ID: ${userId} | Date: ${date} | Time: ${time}</p>
        </div>
        
        <div class="container">
          <div class="section summary">
            <h2>Summary</h2>
            <p>This report provides an overview of your transaction activity.</p>
            <p>Successful Transactions: <span class="success">${successfulTransactions.length}</span></p>
            <p>Failed Transactions: <span class="failure">${failedTransactions.length}</span></p>
          </div>
    `;
    
    if (includePortfolio && portfolio) {
      html += `
        <div class="section">
          <h2>Portfolio Overview</h2>
          <p>Total Portfolio Value: $${portfolio.totalValue.toFixed(2)}</p>
          <p>Number of Holdings: ${portfolio.holdings.length}</p>
          
          <table>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Average Price</th>
              <th>Current Value</th>
            </tr>
      `;
      
      portfolio.holdings.forEach(holding => {
        const currentValue = holding.quantity * holding.averagePrice;
        html += `
          <tr>
            <td>${holding.symbol}</td>
            <td>${holding.quantity}</td>
            <td>$${holding.averagePrice.toFixed(2)}</td>
            <td>$${currentValue.toFixed(2)}</td>
          </tr>
        `;
      });
      
      html += `
          </table>
        </div>
      `;
    }
    
    if (includeTransactions && (successfulTransactions.length > 0 || failedTransactions.length > 0)) {
      html += `
        <div class="section">
          <h2>Transaction Details</h2>
      `;
      
      if (successfulTransactions.length > 0) {
        html += `
          <h3 class="success">Successful Transactions</h3>
          <table>
            <tr>
              <th>ID</th>
              <th>Symbol</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
        `;
        
        successfulTransactions.forEach(tx => {
          html += `
            <tr>
              <td>${tx.id}</td>
              <td>${tx.symbol}</td>
              <td>${tx.type}</td>
              <td>${tx.quantity}</td>
              <td>$${tx.price.toFixed(2)}</td>
              <td>$${tx.totalValue.toFixed(2)}</td>
              <td>${new Date(tx.timestamp).toLocaleString()}</td>
            </tr>
          `;
        });
        
        html += `</table>`;
      }
      
      if (failedTransactions.length > 0) {
        html += `
          <h3 class="failure">Failed Transactions</h3>
          <table>
            <tr>
              <th>ID</th>
              <th>Symbol</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Date</th>
            </tr>
        `;
        
        failedTransactions.forEach(tx => {
          html += `
            <tr>
              <td>${tx.id}</td>
              <td>${tx.symbol}</td>
              <td>${tx.type}</td>
              <td>${tx.quantity}</td>
              <td>$${tx.price.toFixed(2)}</td>
              <td>${new Date(tx.timestamp).toLocaleString()}</td>
            </tr>
          `;
        });
        
        html += `</table>`;
      }
      
      html += `</div>`;
    }
    
    html += `
        <div class="footer">
          <p>This is an automated report generated by Fuse API. Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} Fuse Finance. All rights reserved.</p>
        </div>
      </div>
      </body>
      </html>
    `;
    
    return html;
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

  /**
   * Create a plain text version of the email for clients that don't support HTML
   */
  private createTextVersion(userId: string, successCount: number, failedCount: number): string {
    return `
Transaction Report for ${userId}
Generated: ${new Date().toLocaleString()}

SUMMARY
-------
Successful Transactions: ${successCount}
Failed Transactions: ${failedCount}

This is an automated report generated by Fuse API. Please do not reply to this email.
© ${new Date().getFullYear()} Fuse Finance. All rights reserved.
    `.trim();
  }
} 