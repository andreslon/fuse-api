import { Controller, Get, Param, Query } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StockDto } from './dto/stock.dto';
import { ListStocksDto } from './dto/list-stocks.dto';
import { PaginatedResponseInterface } from '../../shared/pagination/paginated-response.interface';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('stocks')
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  @ApiOperation({ summary: 'List available stocks', description: 'Returns a paginated list of available stocks' })
  @ApiResponse({ status: 200, description: 'List of stocks retrieved successfully' })
  @ApiResponse({ status: 503, description: 'Stock service unavailable' })
  async getPaginatedStocks(@Query() queryParams: ListStocksDto): Promise<PaginatedResponseInterface<StockDto>> {
    return this.stocksService.getPaginatedStocks(queryParams);
  }

  @Get(':symbol')
  @ApiOperation({ summary: 'Get stock by symbol', description: 'Returns a single stock by its symbol' })
  @ApiParam({ name: 'symbol', description: 'Stock symbol', example: 'AAPL' })
  @ApiResponse({ status: 200, description: 'Stock retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Stock not found' })
  async getStockBySymbol(@Param('symbol') symbol: string): Promise<StockDto> {
    return this.stocksService.getStockBySymbol(symbol);
  }
} 