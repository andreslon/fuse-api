import { Controller, Get } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StockDto } from './dto/stock.dto';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  async getStocks(): Promise<StockDto[]> {
    return this.stocksService.getStocks();
  }
} 