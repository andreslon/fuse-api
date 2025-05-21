import { Injectable, Logger } from '@nestjs/common';
import { ReportDeliveryStrategy } from './report-delivery-strategy.interface';
import { PortfolioDto } from '../../portfolio/dto/portfolio.dto';

/**
 * In-app notification delivery strategy for portfolio reports
 * In a real application, this would store notifications in a database
 * and potentially use websockets for real-time delivery
 */
@Injectable()
export class InAppDeliveryStrategy implements ReportDeliveryStrategy {
  private readonly logger = new Logger(InAppDeliveryStrategy.name);

  /**
   * Send portfolio report via in-app notification
   */
  async deliverReport(
    userId: string, 
    content: string, 
    portfolio: PortfolioDto,
  ): Promise<boolean> {
    try {
      // In a real application, you would:
      // 1. Store the notification in a database
      // 2. Potentially push it via websockets if the user is online
      
      this.logger.log(`[MOCK] In-app notification created for ${userId} with portfolio value: $${portfolio.totalValue.toFixed(2)}`);
      
      // Simulate storing notification
      await this.mockStoreNotification(userId, content, portfolio);
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to create in-app notification for ${userId}: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Get the name of the strategy
   */
  getName(): string {
    return 'In-App Notification';
  }
  
  /**
   * Mock notification storage
   */
  private async mockStoreNotification(
    userId: string, 
    content: string, 
    portfolio: PortfolioDto
  ): Promise<void> {
    // Simulate database operation
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Mock notification object
    const notification = {
      id: Math.random().toString(36).substring(7),
      userId,
      type: 'PORTFOLIO_REPORT',
      title: 'Daily Portfolio Report',
      summary: `Your portfolio is valued at $${portfolio.totalValue.toFixed(2)}`,
      content: content,
      created: new Date(),
      read: false,
    };
    
    this.logger.debug(`Notification stored: ${JSON.stringify(notification.id)}`);
  }
} 