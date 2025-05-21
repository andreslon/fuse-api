import { Body, Controller, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { BuyStockDto } from './dto/buy-stock.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('buy')
  async buyStock(@Body() buyStockDto: BuyStockDto): Promise<TransactionResponseDto> {
    return this.transactionsService.buyStock(buyStockDto);
  }
} 