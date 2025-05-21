import { Injectable, Logger } from '@nestjs/common';
import { ReportDeliveryStrategy } from './strategy/report-delivery-strategy.interface';
import { PortfolioDto } from '../portfolio/dto/portfolio.dto';

/**
 * Service to handle the delivery of reports
 * Manages and delegates to different delivery strategies
 */
@Injectable()
export class ReportDeliveryService {
  private readonly logger = new Logger(ReportDeliveryService.name);
  private readonly strategies: ReportDeliveryStrategy[] = [];

  /**
   * Register a delivery strategy
   * @param strategy The strategy to register
   */
  registerStrategy(strategy: ReportDeliveryStrategy): void {
    this.strategies.push(strategy);
    this.logger.log(`Registered delivery strategy: ${strategy.getName()}`);
  }

  /**
   * Deliver a report through all registered strategies
   * @param userId User ID
   * @param content Report content
   * @param portfolio Portfolio data
   * @returns Results from all delivery attempts
   */
  async deliverReport(
    userId: string,
    content: string,
    portfolio: PortfolioDto,
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    if (this.strategies.length === 0) {
      this.logger.warn('No delivery strategies registered');
      return results;
    }
    
    // Attempt delivery using each strategy
    for (const strategy of this.strategies) {
      const strategyName = strategy.getName();
      try {
        results[strategyName] = await strategy.deliverReport(userId, content, portfolio);
        
        this.logger.log(`Delivered report to ${userId} via ${strategyName}: ${results[strategyName] ? 'success' : 'failed'}`);
      } catch (error) {
        this.logger.error(`Error delivering report via ${strategyName}: ${error.message}`);
        results[strategyName] = false;
      }
    }
    
    return results;
  }
  
  /**
   * Get list of registered strategies
   */
  getRegisteredStrategies(): string[] {
    return this.strategies.map(strategy => strategy.getName());
  }
} 