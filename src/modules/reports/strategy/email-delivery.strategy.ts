import { Injectable, Logger } from '@nestjs/common';
import { ReportDeliveryStrategy } from './report-delivery-strategy.interface';
import { PortfolioDto } from '../../portfolio/dto/portfolio.dto';

/**
 * Email delivery strategy for sending portfolio reports
 * In a real application, this would use a proper email service
 */
@Injectable()
export class EmailDeliveryStrategy implements ReportDeliveryStrategy {
  private readonly logger = new Logger(EmailDeliveryStrategy.name);

  /**
   * Send portfolio report via email
   */
  async deliverReport(
    userId: string, 
    content: string, 
    portfolio: PortfolioDto,
  ): Promise<boolean> {
    try {
      // In a real application, you would inject and use a proper email service here
      // For example: await this.mailService.sendEmail({ to: user.email, subject: 'Your Daily Portfolio Report', html: content });
      
      this.logger.log(`[MOCK] Email report sent to ${userId} with portfolio value: $${portfolio.totalValue.toFixed(2)}`);
      
      // Simulate email sending
      await this.mockSendEmail(userId, content);
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email report to ${userId}: ${error.message}`);
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
   * Mock email sending function
   * @param userId User to send to
   * @param content Email content
   */
  private async mockSendEmail(userId: string, content: string): Promise<void> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Log success
    this.logger.debug(`Email delivery simulation: ${content.substring(0, 50)}...`);
  }
} 