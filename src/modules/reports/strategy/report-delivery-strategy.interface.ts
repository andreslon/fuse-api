import { PortfolioDto } from '../../portfolio/dto/portfolio.dto';

/**
 * Interface defining the strategy for report delivery
 * This allows multiple delivery methods (email, SMS, etc.) to be implemented
 */
export interface ReportDeliveryStrategy {
  /**
   * Deliver a report for a specific portfolio
   * @param userId User ID to deliver report to
   * @param content Report content
   * @param portfolio Portfolio data
   * @returns Promise that resolves when delivery is complete
   */
  deliverReport(
    userId: string, 
    content: string, 
    portfolio: PortfolioDto,
  ): Promise<boolean>;

  /**
   * Get the name of the delivery strategy for logging
   */
  getName(): string;
} 