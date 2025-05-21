import { Controller, Get, Param } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioDto } from './dto/portfolio.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get user portfolio', description: 'Returns the portfolio for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'user1' })
  @ApiResponse({ status: 200, description: 'Portfolio retrieved successfully', type: PortfolioDto })
  @ApiResponse({ status: 404, description: 'Portfolio not found' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve portfolio' })
  async getPortfolio(@Param('userId') userId: string): Promise<PortfolioDto> {
    return this.portfolioService.getPortfolio(userId);
  }
} 