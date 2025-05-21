import { PortfolioDto } from '../dto/portfolio.dto';

/**
 * Repository interface for portfolio data access
 */
export interface PortfolioRepository {
  /**
   * Get a user's portfolio
   * @param userId The user ID
   * @returns The user's portfolio data
   */
  getPortfolio(userId: string): Promise<PortfolioDto>;

  /**
   * Update a user's portfolio after a transaction
   * @param userId The user ID
   * @param portfolio The updated portfolio data
   * @returns The updated portfolio
   */
  updatePortfolio(userId: string, portfolio: PortfolioDto): Promise<PortfolioDto>;
} 