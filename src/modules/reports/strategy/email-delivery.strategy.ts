import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReportDeliveryStrategy } from './report-delivery-strategy.interface';
import { PortfolioDto } from '../../portfolio/dto/portfolio.dto';
import { SendGridService } from '../../../core/messaging/email/sendgrid.service';

/**
 * Email delivery strategy for sending reports via SendGrid
 */
@Injectable()
export class EmailDeliveryStrategy implements ReportDeliveryStrategy {
  private readonly logger = new Logger(EmailDeliveryStrategy.name);
  private readonly recipientEmail: string;

  constructor(
    private readonly sendGridService: SendGridService,
    private readonly configService: ConfigService,
  ) {
    const recipient = this.configService.get<string>('REPORT_RECIPIENT_EMAIL');
    if (!recipient) {
      throw new Error('REPORT_RECIPIENT_EMAIL must be set in the environment variables');
    }
    this.recipientEmail = recipient;
  }

  /**
   * Send transaction report via email
   */
  async deliverReport(
    userId: string, 
    content: string, 
    portfolio: PortfolioDto,
  ): Promise<boolean> {
    try {
      this.logger.log(`Sending email report to ${this.recipientEmail} for user ${userId}`);
      
      // Send the email using SendGrid
      await this.sendGridService.sendEmail({
        to: this.recipientEmail,
        subject: `Daily Transaction Report for ${userId}`,
        html: content,
        text: this.createTextVersion(content, portfolio),
      });
      
      this.logger.log(`Email report sent successfully to ${this.recipientEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email report: ${error.message}`, error.stack);
      return false;
    }
  }
  
  /**
   * Get the name of the strategy
   */
  getName(): string {
    return 'Email';
  }
  
  /**
   * Create a plain text version of the email for clients that don't support HTML
   */
  private createTextVersion(htmlContent: string, portfolio: PortfolioDto): string {
    // Simple text version that just extracts key information
    return `
Daily Transaction Report for ${portfolio.userId}
Generated: ${new Date().toLocaleString()}
Total Portfolio Value: $${portfolio.totalValue.toFixed(2)}

Number of Holdings: ${portfolio.holdings.length}

This is an automated report. Please do not reply to this email.
    `.trim();
  }
} 