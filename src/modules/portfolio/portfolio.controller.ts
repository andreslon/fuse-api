import { Controller, Get, Param } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioDto } from './dto/portfolio.dto';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get(':userId')
  async getPortfolio(@Param('userId') userId: string): Promise<PortfolioDto> {
    return this.portfolioService.getPortfolio(userId);
  }
} 