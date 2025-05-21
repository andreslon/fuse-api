import { Body, Controller, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { BuyStockDto } from './dto/buy-stock.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('buy')
  @ApiOperation({ summary: 'Buy stock', description: 'Execute a stock purchase transaction' })
  @ApiBody({ type: BuyStockDto, description: 'Stock purchase information' })
  @ApiResponse({ status: 201, description: 'Transaction completed successfully', type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request or transaction failed' })
  @ApiResponse({ status: 404, description: 'Stock not found' })
  @ApiResponse({ status: 500, description: 'Failed to process transaction' })
  async buyStock(@Body() buyStockDto: BuyStockDto): Promise<TransactionResponseDto> {
    return this.transactionsService.buyStock(buyStockDto);
  }
} 